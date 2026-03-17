// Password strength validation utility

export interface PasswordStrength {
  score: number; // 0-4 (very weak to very strong)
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  isValid: boolean;
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigits: true,
  requireSpecialChars: true,
};

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return {
      score: 0,
      level: 'very-weak',
      feedback: ['Le mot de passe est vide'],
      isValid: false,
    };
  }

  // Check length
  if (password.length >= PASSWORD_REQUIREMENTS.minLength) {
    score += 1;
  } else {
    feedback.push(`Minimum ${PASSWORD_REQUIREMENTS.minLength} caractères (actuellement ${password.length})`);
  }

  // Check uppercase
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Au moins une majuscule requise');
  }

  // Check lowercase
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Au moins une minuscule requise');
  }

  // Check digits
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Au moins un chiffre requis');
  }

  // Check special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Au moins un caractère spécial requis (!@#$%^&*...)');
  }

  // Determine level
  let level: PasswordStrength['level'];
  if (score <= 1) level = 'very-weak';
  else if (score <= 2) level = 'weak';
  else if (score <= 3) level = 'fair';
  else if (score <= 4) level = 'good';
  else level = 'strong';

  const isValid = score === 5;

  return {
    score,
    level,
    feedback,
    isValid,
  };
}
