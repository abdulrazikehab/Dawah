const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware to check role
const authorizeRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
      }
      next();
    } catch (_error) {
      res.sendStatus(500);
    }
  };
};

// --- Auth API ---

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // FIRST USER IS ADMIN (Simple logic for dev)
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (_error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.sendStatus(404);
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (_error) {
    res.sendStatus(500);
  }
});

// --- Admin API ---

// Create Employee (Admin Only)
app.post('/api/admin/employees', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'EMPLOYEE'
      }
    });

    res.status(201).json({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Get All Employees (Admin Only)
app.get('/api/admin/employees', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json(employees);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get detailed backend stats/dashboard data (Admin Only)
app.get('/api/admin/dashboard', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    // Simplified dashboard logic
    // Simple mock logic for "today" filtering as dates are strings in current schema
    // In production, date handling should be robust. Assuming 'YYYY/MM/DD' format in DB.
    
    const allEvents = await prisma.event.findMany({
      include: {
        user: { select: { name: true, email: true } },
        guests: true,
        employees: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(allEvents);
  } catch (_error) {
    console.error(_error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Assign Employee to Event (Admin Only)
app.post('/api/admin/events/:eventId/assign', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { employeeId } = req.body;

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        employees: {
          connect: { id: employeeId }
        }
      },
      include: { employees: true }
    });

    res.json(event);
  } catch (_error) {
    console.error(_error);
    res.status(500).json({ error: 'Failed to assign employee' });
  }
});

// --- Employee API ---

// Get Assigned Events (Employee Dashboard)
app.get('/api/employee/events', authenticateToken, authorizeRole(['EMPLOYEE']), async (req, res) => {
  try {
    // Simplified events logic
    // In a real app, you'd filter by date strictly. 
    // Here we return all assigned events for now or filter if 'date' query param exists.
    
    const assignedEvents = await prisma.event.findMany({
      where: {
        employees: {
          some: {
            id: req.user.userId
          }
        },
        // status: 'active' 
      },
      include: {
        _count: {
          select: { guests: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(assignedEvents);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch assigned events' });
  }
});

// Get Event Details with Checklist (Employee View)
app.get('/api/employee/events/:id/details', authenticateToken, authorizeRole(['EMPLOYEE']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure employee is assigned
    const event = await prisma.event.findFirst({
      where: {
        id,
        employees: {
          some: { id: req.user.userId }
        }
      },
      include: {
        guests: {
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!event) return res.status(404).json({ error: 'Event not found or not assigned' });

    res.json(event);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// Check-in Guest (QR Code Scan)
app.post('/api/guests/:id/checkin', authenticateToken, authorizeRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const guest = await prisma.guest.findUnique({ where: { id } });
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    // Validate employee assignment to this event? 
    // Usually yes, but for speed allowing EMPLOYEE role to check-in if they hav scan permission.
    // Ideally: Check if req.user is assigned to guest.eventId

    // Check if already checked in
    if (guest.checkInStatus === 'checked_in') {
      return res.status(400).json({ error: 'Guest already checked in', guest });
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        checkInStatus: 'checked_in',
        checkedInAt: new Date()
      }
    });

    res.json(updatedGuest);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to check in guest' });
  }
});

// --- Events API ---

// Create an event (Protected)
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      eventType,
      hostName,
      honoreeName,
      date,
      time,
      location,
      message,
      guestCount,
      templateId,
      packageId,
      themeId,
      preInvitedGuests
    } = req.body;

    const event = await prisma.event.create({
      data: {
        userId: req.user.userId, // Associate with logged-in user
        title,
        eventType,
        hostName,
        honoreeName,
        date,
        time,
        location,
        message,
        guestCount: parseInt(guestCount),
        templateId,
        themeId,
        packageId,
        status: 'active',
        guests: {
          create: preInvitedGuests ? preInvitedGuests.map(guest => ({
            name: guest.name,
            phone: guest.phone,
            maxCompanions: parseInt(guest.maxCompanions) || 1
          })) : []
        }
      },
      include: {
        guests: true
      }
    });

    res.status(201).json(event);
  } catch (_error) {
    console.error('Error creating event:', _error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Get user's events (Protected)
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { userId: req.user.userId }, // Filter by user
      include: {
        guests: true
      }
    });
    res.json(events);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event (Public for RSVP, but could restrict details if needed)
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        guests: true,
        template: true
      }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Update event (Protected)
app.patch('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      eventType,
      hostName,
      honoreeName,
      date,
      time,
      location,
      message,
      guestCount,
      templateId,
      themeId,
      packageId
    } = req.body;

    // Verify ownership
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent || existingEvent.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        eventType,
        hostName,
        honoreeName,
        date,
        time,
        location,
        message,
        guestCount: guestCount ? parseInt(guestCount) : undefined,
        templateId,
        themeId,
        packageId
      }
    });

    res.json(updatedEvent);
  } catch (_error) {
    console.error('Error updating event:', _error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// --- Guests API ---

// RSVP for a guest (Public)
app.patch('/api/guests/:id/rsvp', async (req, res) => {
  try {
    const { rsvpStatus, actualCompanions } = req.body;
    const guest = await prisma.guest.update({
      where: { id: req.params.id },
      data: { 
        rsvpStatus,
        actualCompanions: parseInt(actualCompanions) || 0
      }
    });
    res.json(guest);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update RSVP' });
  }
});

// Add a guest to an event (Protected - Only host should add guests manually?)
// For now, let's keep it open or protect it. Usually host adds guests. Public requests might go through a different flow.
// Assuming this is for the host dashboard to add guests manually.
app.post('/api/events/:id/guests', authenticateToken, async (req, res) => {
  try {
    // Verify ownership
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event || event.userId !== req.user.userId) return res.sendStatus(403);

    const { name, phone, rsvpStatus, actualCompanions, maxCompanions } = req.body;
    const guest = await prisma.guest.create({
      data: {
        eventId: req.params.id,
        name,
        phone,
        rsvpStatus: rsvpStatus || 'pending',
        actualCompanions: parseInt(actualCompanions) || 0,
        maxCompanions: parseInt(maxCompanions) || 1
      }
    });
    res.status(201).json(guest);
  } catch (_error) {
    console.error('Error adding guest:', _error);
    res.status(500).json({ error: 'Failed to add guest' });
  }
});

// Public RSVP - Guest self-registration (no auth needed)
app.post('/api/events/:id/rsvp', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const { name, phone, rsvpStatus, actualCompanions } = req.body;
    const guest = await prisma.guest.create({
      data: {
        eventId: req.params.id,
        name,
        phone,
        rsvpStatus: rsvpStatus || 'attending',
        actualCompanions: parseInt(actualCompanions) || 0,
        maxCompanions: 0
      }
    });
    res.status(201).json(guest);
  } catch (_error) {
    console.error('Error with public RSVP:', _error);
    res.status(500).json({ error: 'Failed to RSVP' });
  }
});

// --- Templates API ---

app.get('/api/templates', async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (_error) {
    console.error('Error fetching templates:', _error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// --- Packages API (Admin) ---

// Get all packages (Public)
app.get('/api/packages', async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { price: 'asc' }
    });
    res.json(packages);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Create Package (Admin Only)
app.post('/api/admin/packages', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const { name, nameAr, price, features } = req.body;
    const pkg = await prisma.package.create({
      data: { name, nameAr, price: parseFloat(price), features }
    });
    res.status(201).json(pkg);
  } catch (_error) {
    console.error(_error);
    res.status(500).json({ error: 'Failed to create package' });
  }
});

// Update Package (Admin Only)
app.put('/api/admin/packages/:id', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nameAr, price, features } = req.body;
    const pkg = await prisma.package.update({
      where: { id },
      data: { name, nameAr, price: parseFloat(price), features }
    });
    res.json(pkg);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update package' });
  }
});

// Delete Package (Admin Only)
app.delete('/api/admin/packages/:id', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.package.delete({ where: { id } });
    res.sendStatus(204);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete package' });
  }
});

// --- Support API ---

// Create a ticket (User/Employee)
app.post('/api/support/tickets', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, priority } = req.body;
    const ticket = await prisma.supportTicket.create({
      data: {
        title,
        description,
        type: type || 'TICKET',
        priority: priority || 'medium',
        userId: req.user.userId
      }
    });
    res.status(201).json(ticket);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get user's tickets
app.get('/api/support/tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// --- Admin Tickets/Users API ---

// Get all tickets (Admin Only)
app.get('/api/admin/tickets', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Update ticket status (Admin Only)
app.patch('/api/admin/tickets/:id', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { 
        ...(status && { status }),
        ...(priority && { priority })
      }
    });
    res.json(ticket);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Get all users (Admin Only)
app.get('/api/admin/users', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// --- Checkout API ---

app.post('/api/checkout', authenticateToken, async (req, res) => {
  try {
    const { packageId } = req.body;
    
    // In a real app, integrate with Stripe/PayTabs etc here.
    // For now, we'll just "success" it and unlock potential features.
    
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    // Update user status or record transaction? 
    // The Event model has packageId. Maybe the checkout is linked to a specific event?
    // Or just "unlock" features globally for the user.
    
    res.json({ success: true, message: 'Payment successful', package: pkg });
  } catch (_error) {
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

const initializeAdmin = async () => {
  const adminEmail = 'admin@admin.com';
  const adminPassword = 'NQMZ@Z*r8RMQxaE3'; // From USER_REQUEST
  
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN'
      }
    });
    console.log('Admin user created');
  } else {
    // Optionally update password if requested, but let's stick to simple existence check.
    console.log('Admin user already exists');
  }
};

app.listen(PORT, async () => {
  await initializeAdmin();
  console.log(`Server is running on port ${PORT}`);
});
