const ANSWER_WEIGHTS = {
    q1: { category: 'attachment', weights: { 'Cool down alone': { avoidant: 2 }, 'Fix it immediately': { anxious: 2 }, 'Shut down completely': { avoidant: 3 }, 'Pretend its fine': { passive: 2 } } },
    q2: { category: 'attachment', weights: { 'Panic and check in': { anxious: 3 }, 'Give them space': { secure: 2 }, 'Spiral internally': { anxious: 2 }, 'Match their silence': { avoidant: 2 } } },
    q3: { category: 'communication', weights: { 'Saying it straight': { direct: 3 }, 'Dropping hints': { passive: 3 }, 'Writing it out': { expressive: 2 }, 'Waiting too long': { passive: 2 } } },
    q4: { category: 'communication', weights: { 'Words, say it out loud': { verbal: 3 }, 'Actions, just show up': { physical: 3 }, 'Time, be present': { presence: 3 }, 'Touch, says everything': { physical: 2 } } },
    q5: { category: 'communication', weights: { 'Fix the problem': { solution: 3 }, 'Just listen': { empathetic: 3 }, 'Feel it with them': { expressive: 2 }, 'Give them space': { avoidant: 2 } } },
    q6: { category: 'communication', weights: { 'Brutally honest': { direct: 3 }, 'Honest but careful': { direct: 2 }, 'Soften everything': { passive: 2 }, 'Avoid conflict': { passive: 3 } } },
    q7: { category: 'energy', weights: { 'Always full': { high: 3 }, 'Picky with people': { medium: 2 }, 'Drains fast': { low: 3 }, 'Completely unpredictable': { variable: 3 } } },
    q8: { category: 'energy', weights: { 'Fast, you just know': { high: 3 }, 'Slow, trust takes time': { low: 2 }, 'Organic, no timeline': { medium: 2 }, 'Structured, need clarity': { high: 2 } } },
    q9: { category: 'energy', weights: { 'Spontaneous trip, no plan': { high: 3 }, 'Couch, food, show': { low: 3 }, 'Outside, moving, exploring': { high: 2 }, 'Doing your own thing': { independent: 3 } } },
    q10: { category: 'energy', weights: { 'The one who initiates': { high: 2 }, 'The one who responds': { low: 2 }, 'Pretty equal': { medium: 3 }, 'Pull back when intense': { avoidant: 2 } } },
    q11: { category: 'values', weights: { 'Something real': { serious: 3 }, 'Something fun': { casual: 3 }, 'Connection first': { exploratory: 2 }, 'Still figuring it out': { undefined: 2 } } },
    q12: { category: 'values', weights: { 'Ambition': { growth: 3 }, 'Emotional maturity': { depth: 3 }, 'Loyalty': { security: 3 }, 'Humor': { lightness: 3 } } },
    q13: { category: 'values', weights: { 'Cannot communicate': { needs_direct: 3 }, 'Emotionally unavailable': { needs_secure: 3 }, 'Too clingy': { needs_space: 3 }, 'No direction in life': { needs_ambitious: 3 } } },
    q14: { category: 'identity', weights: { 'Humor': { light: 3 }, 'Ambition': { driven: 3 }, 'Depth': { intense: 3 }, 'Calm energy': { grounded: 3 } } },
    q15: { category: 'attachment', weights: { 'Open, love hard': { anxious: 1, secure: 2 }, 'Guarded, slow to trust': { avoidant: 2 }, 'Healing right now': { vulnerable: 3 }, 'Ready, lets go': { secure: 3 } } },
  };
  
  export function buildProfile(answers) {
    const profile = { attachment: {}, communication: {}, energy: {}, values: {}, identity: {} };
    for (const [qid, answer] of Object.entries(answers)) {
      const qConfig = ANSWER_WEIGHTS[qid];
      if (!qConfig) continue;
      const category = qConfig.category;
      const weights = qConfig.weights[answer] || {};
      for (const [trait, score] of Object.entries(weights)) {
        profile[category][trait] = (profile[category][trait] || 0) + score;
      }
    }
    return profile;
  }
  
  export function calculateCompatibility(profileA, profileB) {
    const valuesScore = calculateValuesScore(profileA.values, profileB.values);
    const commScore = calculateCommScore(profileA.communication, profileB.communication);
    const energyScore = calculateEnergyScore(profileA.energy, profileB.energy);
    const total = (valuesScore * 0.40) + (commScore * 0.35) + (energyScore * 0.25);
    return Math.round(total);
  }
  
  function calculateValuesScore(valA, valB) {
    let score = 50;
    const intentA = getDominant(valA, ['serious', 'casual', 'exploratory']);
    const intentB = getDominant(valB, ['serious', 'casual', 'exploratory']);
    if (intentA === intentB) score += 30;
    else if ((intentA === 'serious' && intentB === 'casual') || (intentA === 'casual' && intentB === 'serious')) score -= 20;
    else score += 10;
    const needA = getDominant(valA, ['needs_direct', 'needs_secure', 'needs_space', 'needs_ambitious']);
    const needB = getDominant(valB, ['needs_direct', 'needs_secure', 'needs_space', 'needs_ambitious']);
    if (needA === 'needs_space' && needB === 'needs_secure') score -= 15;
    else if (needA === needB) score += 10;
    return Math.min(100, Math.max(0, score));
  }
  
  function calculateCommScore(commA, commB) {
    let score = 50;
    const styleA = getDominant(commA, ['direct', 'passive', 'expressive']);
    const styleB = getDominant(commB, ['direct', 'passive', 'expressive']);
    if (styleA === 'direct' && styleB === 'direct') score += 30;
    else if (styleA === 'direct' && styleB === 'passive') score -= 20;
    else if (styleA === 'expressive' && styleB === 'empathetic') score += 25;
    else if (styleA === styleB) score += 20;
    else score += 5;
    return Math.min(100, Math.max(0, score));
  }
  
  function calculateEnergyScore(energyA, energyB) {
    let score = 50;
    const levelA = getDominant(energyA, ['high', 'medium', 'low', 'variable']);
    const levelB = getDominant(energyB, ['high', 'medium', 'low', 'variable']);
    if (levelA === levelB) score += 25;
    else if ((levelA === 'high' && levelB === 'low') || (levelA === 'low' && levelB === 'high')) score += 15;
    else score += 10;
    return Math.min(100, Math.max(0, score));
  }
  
  function getDominant(obj, keys) {
    let max = 0;
    let dominant = keys[0];
    for (const key of keys) {
      if ((obj[key] || 0) > max) {
        max = obj[key];
        dominant = key;
      }
    }
    return dominant;
  }