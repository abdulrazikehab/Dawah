import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={styles.stepWrapper}>
            <View 
              style={[
                styles.stepCircle, 
                { backgroundColor: colors.backgroundInput, borderColor: colors.border },
                index < currentStep && { backgroundColor: colors.primary, borderColor: colors.primary },
                index === currentStep && { borderColor: colors.primary, backgroundColor: colors.backgroundCard }
              ]}
            >
              {index < currentStep ? (
                <Text style={[styles.checkmark, { color: colors.background }]}>✓</Text>
              ) : (
                <Text style={[
                  styles.stepNumber,
                  { color: colors.textMuted },
                  (index === currentStep || index < currentStep) && { color: colors.primary }
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            {index < steps.length - 1 && (
              <View 
                style={[
                  styles.connector, 
                  { backgroundColor: colors.border },
                  index < currentStep && { backgroundColor: colors.primary }
                ]} 
              />
            )}
          </View>
          <Text style={[
            styles.stepLabel,
            { color: colors.textMuted },
            index <= currentStep && { color: colors.text }
          ]}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  connector: {
    height: 2,
    flex: 1,
    position: 'absolute',
    left: '55%',
    right: '-45%',
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },
});
