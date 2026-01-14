'use client';

import { useState } from 'react';
import { Mail, Key, Award, Trophy, Target } from 'lucide-react';

/**
 * Sistema de gamificación
 * Puntos, badges y logros
 */

// Definición de badges
const BADGES = {
  FIRST_OPERATION: {
    id: 'first_operation',
    name: 'Primera Operación',
    description: 'Completaste tu primera operación',
    icon: Target,
    points: 10,
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Demonio de la Velocidad',
    description: 'Completaste 10 operaciones en un día',
    icon: Trophy,
    points: 50,
  },
  TEAM_PLAYER: {
    id: 'team_player',
    name: 'Jugador de Equipo',
    description: 'Ayudaste a 5 compañeros',
    icon: Award,
    points: 25,
  },
};

// Componente de perfil gamificado
export default function GamificationProfile({ user }) {
  const [points] = useState(user?.points || 0);
  const [level] = useState(Math.floor(points / 100) + 1);
  const [badges] = useState(user?.badges || []);

  const pointsToNextLevel = (level * 100) - points;
  const progress = ((points % 100) / 100) * 100;

  return (
    <div className="gamification-profile">
      <div className="level-card">
        <div className="level-badge">
          Nivel {level}
        </div>
        <div className="points-display">
          <span className="points-value">{points}</span>
          <span className="points-label">puntos</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="next-level-text">
          {pointsToNextLevel} puntos para nivel {level + 1}
        </p>
      </div>

      <div className="badges-section">
        <h3>Insignias Desbloqueadas ({badges.length})</h3>
        <div className="badges-grid">
          {Object.values(BADGES).map(badge => {
            const unlocked = badges.includes(badge.id);
            const Icon = badge.icon;
            
            return (
              <div
                key={badge.id}
                className={`badge-card ${unlocked ? 'unlocked' : 'locked'}`}
              >
                <Icon size={32} />
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
                <span className="badge-points">+{badge.points} pts</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Hook para manejar gamificación
export function useGamification(userId) {
  const awardPoints = (points, reason) => {
    // TODO: API call para agregar puntos
    console.log(`Awarding ${points} points to user ${userId} for ${reason}`);
  };

  const unlockBadge = (badgeId) => {
    // TODO: API call para desbloquear badge
    console.log(`Unlocking badge ${badgeId} for user ${userId}`);
  };

  const checkAchievements = (action) => {
    // Lógica para verificar si se desbloqueó algún logro
    // TODO: Implementar según reglas de negocio
  };

  return {
    awardPoints,
    unlockBadge,
    checkAchievements,
  };
}

/*
Backend integration:

// models.py
class UserPoints(models.Model):
    user = ForeignKey(User)
    points = IntegerField(default=0)
    level = IntegerField(default=1)

class UserBadge(models.Model):
    user = ForeignKey(User)
    badge_id = CharField(max_length=50)
    unlocked_at = DateTimeField(auto_now_add=True)

// Usar en acciones:
const { awardPoints } = useGamification(user.id);

// Al completar operación:
awardPoints(10, 'operation_completed');
*/
