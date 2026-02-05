/**
 * Personality Radar Chart - Native
 *
 * Gráfico de radar interactivo para Big Five usando react-native-svg
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../../theme';

interface PersonalityRadarChartProps {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  size?: number;
}

export function PersonalityRadarChart({
  openness,
  conscientiousness,
  extraversion,
  agreeableness,
  neuroticism,
  size = 280,
}: PersonalityRadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 40;

  // 5 puntos para pentágono (Big Five)
  const angles = [0, 72, 144, 216, 288]; // Grados

  const traits = [
    { label: 'Apertura', value: openness, shortLabel: 'A' },
    { label: 'Responsab.', value: conscientiousness, shortLabel: 'R' },
    { label: 'Extraver.', value: extraversion, shortLabel: 'E' },
    { label: 'Amabilidad', value: agreeableness, shortLabel: 'Am' },
    { label: 'Neurotic.', value: neuroticism, shortLabel: 'N' },
  ];

  // Convertir valor 0-100 a distancia desde centro
  const getPoint = (angle: number, value: number) => {
    const angleRad = (angle - 90) * (Math.PI / 180);
    const distance = (value / 100) * radius;
    return {
      x: center + distance * Math.cos(angleRad),
      y: center + distance * Math.sin(angleRad),
    };
  };

  // Generar puntos del polígono de datos
  const dataPoints = traits.map((trait, i) => getPoint(angles[i], trait.value));
  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Puntos de las líneas guía (círculos concéntricos)
  const guideCircles = [20, 40, 60, 80, 100];

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Círculos guía concéntricos */}
        {guideCircles.map((percent, i) => {
          const r = (percent / 100) * radius;
          return (
            <Circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              stroke="rgba(139, 92, 246, 0.1)"
              strokeWidth="1"
              fill="none"
            />
          );
        })}

        {/* Líneas desde centro hacia cada vértice */}
        {angles.map((angle, i) => {
          const point = getPoint(angle, 100);
          return (
            <Line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="rgba(139, 92, 246, 0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Polígono de datos */}
        <Polygon
          points={polygonPoints}
          fill="rgba(139, 92, 246, 0.3)"
          stroke="#8b5cf6"
          strokeWidth="2"
        />

        {/* Puntos en cada vértice */}
        {dataPoints.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#8b5cf6"
          />
        ))}

        {/* Labels de cada trait */}
        {traits.map((trait, i) => {
          const labelPoint = getPoint(angles[i], 115);
          return (
            <SvgText
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              fill={colors.text.secondary}
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
            >
              {trait.shortLabel}
            </SvgText>
          );
        })}
      </Svg>

      {/* Leyenda debajo */}
      <View style={styles.legend}>
        {traits.map((trait, i) => (
          <View key={i} style={styles.legendItem}>
            <Text style={styles.legendLabel}>{trait.label}</Text>
            <Text style={styles.legendValue}>{trait.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  legend: {
    marginTop: 20,
    width: '100%',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  legendLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '700',
  },
});
