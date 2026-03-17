

type Strength = {
  level: string;
  score: number;
};

export default function StrengthBar({ passwordStrength }: { passwordStrength: Strength }) {
  const getStrengthColor = () => {
    switch (passwordStrength.level) {
      case 'very-weak': return 'bg-error';
      case 'weak': return 'bg-orange-500';
      case 'fair': return 'bg-yellow-500';
      case 'good': return 'bg-blue-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-text-muted';
    }
  };

  const getStrengthLabel = () => {
    switch (passwordStrength.level) {
      case 'very-weak': return 'Très faible';
      case 'weak': return 'Faible';
      case 'fair': return 'Moyen';
      case 'good': return 'Bon';
      case 'strong': return 'Très fort';
      default: return '';
    }
  };

  const width = `${(passwordStrength.score / 5) * 100}%`;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-surface-dark rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width }}
        />
      </div>
      <span className="text-xs text-text-muted whitespace-nowrap">{getStrengthLabel()}</span>
    </div>
  );
}


