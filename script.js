const commonPasswords = [
  '123456',
  'password',
  '123456789',
  '12345678',
  '12345',
  'qwerty',
  'abc123',
  '111111',
  'password1',
  '123123'
];

const passwordInput = document.getElementById('passwordInput');
const toggleButton = document.getElementById('toggleButton');
const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');
const scoreBadge = document.getElementById('scoreBadge');
const crackTime = document.getElementById('crackTime');
const securityStatus = document.getElementById('securityStatus');
const suggestionList = document.getElementById('suggestionList');

const strengthLevels = [
  { label: 'Highly Insecure', color: 'bg-red-500' },
  { label: 'Weak', color: 'bg-orange-500' },
  { label: 'Fair', color: 'bg-yellow-400' },
  { label: 'Strong', color: 'bg-emerald-500' },
  { label: 'Secure', color: 'bg-teal-500' }
];

function analyzePassword(value) {
  const length = value.length;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  const isCommon = commonPasswords.includes(value);

  let score = 0;

  if (length > 0) {
    score += Math.min(length, 12) * 4;
    if (length >= 12) score += 10;
    if (length >= 16) score += 5;
  }

  score += hasLower ? 12 : 0;
  score += hasUpper ? 12 : 0;
  score += hasNumber ? 12 : 0;
  score += hasSymbol ? 18 : 0;

  if (hasUpper && hasLower && hasNumber && hasSymbol) score += 12;

  if (isCommon) score = Math.min(score, 18);
  score = Math.max(0, Math.min(score, 100));

  return {
    score,
    isCommon,
    hasUpper,
    hasLower,
    hasNumber,
    hasSymbol,
    length
  };
}

function getEstimate(password, score, isCommon) {
  if (!password) return 'N/A';
  if (isCommon) return 'Instantly';

  const pool = getPoolSize(password);
  const combos = Math.pow(pool, password.length);
  const guessesPerSecond = 1e10;
  const seconds = combos / guessesPerSecond;

  if (seconds < 1) return 'Instantly';
  if (seconds < 60) return 'Seconds';
  if (seconds < 3_600) return 'Minutes';
  if (seconds < 86_400) return 'Hours';
  if (seconds < 2_592_000) return 'Days';
  if (seconds < 31_536_000) return 'Months';
  if (seconds < 315_360_000) return 'Years';
  if (seconds < 3_153_600_000) return 'Decades';
  return 'Centuries';
}

function getPoolSize(password) {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 32;
  return pool || 1;
}

function getStatus(score, isCommon) {
  if (!score) return 'Waiting for input';
  if (isCommon) return 'Insecure';
  if (score < 35) return 'Weak';
  if (score < 60) return 'Fair';
  if (score < 80) return 'Strong';
  return 'Secure';
}

function getLevel(score, isCommon) {
  if (!score || isCommon) return strengthLevels[0];
  if (score < 35) return strengthLevels[1];
  if (score < 60) return strengthLevels[2];
  if (score < 80) return strengthLevels[3];
  return strengthLevels[4];
}

function buildSuggestions({ length, hasUpper, hasLower, hasNumber, hasSymbol, isCommon }) {
  const suggestions = [];

  if (!length) {
    suggestions.push('Start with a password that is at least 12 characters long.');
    suggestions.push('Use mixed case, numbers, and special characters.');
    return suggestions;
  }
  if (isCommon) suggestions.push('Avoid common passwords such as "123456" and "password".');
  if (length < 12) suggestions.push('Make it longer than 12 characters.');
  if (!hasUpper) suggestions.push('Add at least one uppercase letter.');
  if (!hasLower) suggestions.push('Add at least one lowercase letter.');
  if (!hasNumber) suggestions.push('Include at least one number.');
  if (!hasSymbol) suggestions.push('Include at least one special character like !@#$%.');
  if (length >= 12 && hasUpper && hasLower && hasNumber && hasSymbol) {
    suggestions.push('Consider using a passphrase for even stronger protection.');
  }
  if (!suggestions.length) suggestions.push('Your password is strong; keep it long and unique.');

  return suggestions;
}

function renderSuggestions(items) {
  suggestionList.innerHTML = items
    .map(
      (item) =>
        `<li class="flex items-start gap-3 rounded-2xl bg-slate-950/80 border border-slate-800 px-4 py-3"><span class="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-sky-400"></span><span>${item}</span></li>`
    )
    .join('');
}

function updateUI(value) {
  const analysis = analyzePassword(value);
  const estimate = getEstimate(value, analysis.score, analysis.isCommon);
  const status = getStatus(analysis.score, analysis.isCommon);
  const level = getLevel(analysis.score, analysis.isCommon);
  const suggestions = buildSuggestions(analysis);

  strengthLabel.textContent = level.label;
  scoreBadge.textContent = `${analysis.score} / 100`;
  strengthBar.className = `h-full rounded-full transition-all duration-300 ${level.color}`;
  strengthBar.style.width = `${analysis.score}%`;
  crackTime.textContent = estimate;
  securityStatus.textContent = status;
  renderSuggestions(suggestions);
}

passwordInput.addEventListener('input', (event) => {
  updateUI(event.target.value.trim());
});

toggleButton.addEventListener('click', () => {
  const hidden = passwordInput.type === 'password';
  passwordInput.type = hidden ? 'text' : 'password';
  toggleButton.textContent = hidden ? 'Hide' : 'Show';
});
