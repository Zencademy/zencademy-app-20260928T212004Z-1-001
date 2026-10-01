/**
 * Generates lib/ebookContent/catalog.ts with readable chapter content for every library title.
 * Run: node scripts/generate-ebook-catalog.js
 */
const fs = require('fs');
const path = require('path');

const BOOKS = [
  { id: '1', title: 'Mindful Living Guide', category: 'Wellness', premium: false, price: 20 },
  { id: '2', title: 'Stress Management', category: 'Wellness', premium: false, price: 20 },
  { id: '3', title: 'Advanced Meditation Techniques', category: 'Wellness', premium: false, price: 21 },
  { id: '4', title: 'Mind-Body Connection', category: 'Wellness', premium: false, price: 20 },
  { id: '5', title: 'Holistic Health & Wellness', category: 'Wellness', premium: false, price: 21 },
  { id: '6', title: 'Physical Training Fundamentals', category: 'Fitness', premium: false, price: 24 },
  { id: '7', title: 'Elite Performance Training', category: 'Fitness', premium: true, price: 42 },
  { id: '8', title: 'Nutrition Basics', category: 'Fitness', premium: false, price: 18 },
  { id: '9', title: 'Advanced Nutrition Science', category: 'Fitness', premium: true, price: 40 },
  { id: '10', title: 'Cognitive Enhancement', category: 'Mental', premium: true, price: 38 },
  { id: '11', title: 'Mastering Focus & Concentration', category: 'Mental', premium: true, price: 40 },
  { id: '12', title: 'Elite Mental Performance', category: 'Mental', premium: true, price: 44 },
  { id: '13', title: 'Memory Mastery', category: 'Mental', premium: true, price: 42 },
  { id: '14', title: 'Daily Habits for Success', category: 'Productivity', premium: false, price: 18 },
  { id: '15', title: 'Time Management Mastery', category: 'Productivity', premium: false, price: 20 },
  { id: '16', title: 'Leadership & Influence', category: 'Productivity', premium: true, price: 42 },
  { id: '17', title: 'Goal Setting & Achievement', category: 'Productivity', premium: true, price: 38 },
  { id: '18', title: 'Quantum Physics Basics', category: 'Science', premium: true, price: 44 },
  { id: '19', title: 'Artificial Intelligence Fundamentals', category: 'Technology', premium: true, price: 42 },
  { id: '20', title: 'Blockchain & Cryptocurrency', category: 'Technology', premium: true, price: 40 },
  { id: '21', title: 'Programming Fundamentals', category: 'Technology', premium: true, price: 38 },
  { id: '22', title: 'Data Science Essentials', category: 'Science', premium: true, price: 40 },
  { id: '23', title: 'World History Essentials', category: 'Education', premium: false, price: 18 },
  { id: '24', title: 'Philosophy for Modern Life', category: 'Education', premium: true, price: 42 },
  { id: '25', title: 'Economics Fundamentals', category: 'Education', premium: true, price: 38 },
  { id: '26', title: 'Psychology Basics', category: 'Science', premium: true, price: 40 },
  { id: '27', title: 'Entrepreneurship Guide', category: 'Business', premium: true, price: 44 },
  { id: '28', title: 'Personal Finance Mastery', category: 'Business', premium: true, price: 38 },
  { id: '29', title: 'Investment Strategies', category: 'Business', premium: true, price: 46 },
  { id: '30', title: 'Creative Thinking', category: 'Creativity', premium: true, price: 36 },
  { id: '31', title: 'Digital Art Fundamentals', category: 'Creativity', premium: true, price: 38 },
  { id: '32', title: 'Writing Mastery', category: 'Creativity', premium: true, price: 38 },
  { id: '33', title: 'Relationship Psychology', category: 'Lifestyle', premium: true, price: 38 },
  { id: '34', title: 'Parenting Essentials', category: 'Lifestyle', premium: true, price: 40 },
  { id: '35', title: 'Minimalism & Decluttering', category: 'Lifestyle', premium: false, price: 18 },
  { id: '36', title: 'Spiritual Growth', category: 'Spirituality', premium: true, price: 40 },
  { id: '37', title: 'Eastern Philosophy', category: 'Spirituality', premium: true, price: 40 },
  { id: '38', title: 'Mindfulness in Daily Life', category: 'Spirituality', premium: false, price: 20 },
  { id: '39', title: 'Neuroscience of Learning', category: 'Science', premium: true, price: 48 },
  { id: '40', title: 'Quantum Consciousness', category: 'Science', premium: true, price: 46 },
  { id: '41', title: 'Biohacking Fundamentals', category: 'Science', premium: true, price: 44 },
  { id: '42', title: 'Future Technologies', category: 'Technology', premium: true, price: 42 },
  { id: '43', title: 'Elite Performance Mastery', category: 'Premium', premium: true, price: 52 },
  { id: '44', title: 'Advanced Cognitive Enhancement', category: 'Premium', premium: true, price: 54 },
  { id: '45', title: 'Creative Genius Unleashed', category: 'Premium', premium: true, price: 50 },
  { id: '46', title: 'Wealth Building Mastery', category: 'Premium', premium: true, price: 52 },
  { id: '47', title: 'Life Transformation Blueprint', category: 'Premium', premium: true, price: 50 },
];

/** Topic-specific chapter outlines: [title, focus bullets] */
const OUTLINES = {
  '1': [
    ['Introduction to Mindfulness', ['present-moment awareness', 'non-judgment', 'secular practice', 'attention training']],
    ['Daily Mindfulness Practices', ['breath awareness', 'body scan', 'mindful walking', 'mindful eating']],
    ['Emotional Awareness', ['naming feelings', 'urge surfing', 'self-compassion', 'reactivity vs response']],
    ['Mindfulness at Work', ['single-tasking', 'meeting presence', 'digital boundaries', 'micro-pauses']],
    ['Building a Lifelong Practice', ['habit stacking', 'community', 'retreats', 'measuring progress']],
  ],
  '2': [
    ['Understanding Stress', ['acute vs chronic', 'fight-or-flight', 'cortisol', 'allostatic load']],
    ['Quick Calm Techniques', ['box breathing', 'physiological sigh', 'progressive muscle release', 'grounding 5-4-3-2-1']],
    ['Cognitive Reframing', ['thought records', 'catastrophizing', 'control circles', 'values check']],
    ['Lifestyle Buffers', ['sleep hygiene', 'movement', 'social support', 'caffeine and alcohol']],
    ['Long-Term Resilience', ['recovery rituals', 'boundary setting', 'stress audits', 'relapse plans']],
  ],
  '3': [
    ['Foundations for Advanced Practice', ['posture', 'intention', 'ethics', 'consistency']],
    ['Concentration Methods', ['anapanasati', 'counting breath', 'mantra', 'kasina focus']],
    ['Insight Practices', ['noting', 'impermanence', 'choiceless awareness', 'open monitoring']],
    ['Compassion & Loving-Kindness', ['metta phrases', 'self to other', 'difficult people', 'joy practice']],
    ['Integration & Retreat Skills', ['daily schedule', 'walking meditation', 'silence', 'aftercare']],
  ],
  '4': [
    ['The Living Loop', ['interoception', 'gut-brain axis', 'posture and mood', 'embodied cognition']],
    ['Breath as Bridge', ['diaphragmatic breathing', 'HRV', 'breath holds', 'nasal breathing']],
    ['Movement and Mind', ['yoga basics', 'somatic release', 'fascia', 'flow states']],
    ['Sleep and Recovery', ['circadian rhythm', 'wind-down', 'temperature', 'light exposure']],
    ['Daily Integration', ['body check-ins', 'stress signals', 'habit cues', 'training logs']],
  ],
  '5': [
    ['Whole-Person Health', ['physical', 'mental', 'social', 'purpose']],
    ['Nutrition Foundations', ['whole foods', 'protein', 'fiber', 'hydration']],
    ['Movement for Life', ['strength', 'cardio', 'mobility', 'NEAT']],
    ['Rest and Nervous System', ['parasympathetic tone', 'nature time', 'digital sunset', 'therapy']],
    ['Building Your System', ['weekly review', 'metrics that matter', 'community', 'sustainability']],
  ],
  '6': [
    ['Training Principles', ['progressive overload', 'specificity', 'recovery', 'consistency']],
    ['Strength Basics', ['compound lifts', 'sets and reps', 'form cues', 'warmup']],
    ['Cardio & Conditioning', ['zones', 'intervals', 'steady state', 'work capacity']],
    ['Mobility & Injury Prevention', ['ROM', 'stability', 'prehab', 'deload weeks']],
    ['Programming Your Week', ['split options', 'tracking', 'sleep', 'nutrition timing']],
  ],
  '7': [
    ['Performance Mindset', ['process goals', 'arousal control', 'visualization', 'pre-performance routines']],
    ['Periodization', ['macrocycle', 'mesocycle', 'peaking', 'taper']],
    ['Speed Power Endurance', ['plyometrics', 'sprint mechanics', 'aerobic base', 'lactate']],
    ['Recovery Science', ['sleep debt', 'soft tissue', 'cold heat', 'monitoring readiness']],
    ['Competition Day', ['fueling', 'warmup', 'focus cues', 'debrief']],
  ],
  '8': [
    ['Macronutrients', ['protein', 'carbs', 'fats', 'alcohol']],
    ['Micronutrients & Hydration', ['vitamins', 'minerals', 'electrolytes', 'water targets']],
    ['Building Meals', ['plate method', 'protein at each meal', 'fiber', 'satiety']],
    ['Eating for Training', ['pre-workout', 'post-workout', 'travel food', 'snacks']],
    ['Sustainable Habits', ['grocery lists', 'meal prep', 'eating out', 'tracking lightly']],
  ],
  '9': [
    ['Energy Metabolism', ['ATP', 'glycolysis', 'fat oxidation', 'fed vs fasted']],
    ['Protein Science', ['MPS', 'leucine', 'distribution', 'plant vs animal']],
    ['Carbs Timing & Glycogen', ['glycemic context', 'peri-workout', 'low carb cases', 'fiber']],
    ['Fats Hormones Inflammation', ['omega-3', 'saturated fat context', 'cholesterol basics', 'cooking oils']],
    ['Supplements Evidence', ['creatine', 'vitamin D', 'caffeine', 'what to skip']],
  ],
  '10': [
    ['How Cognition Works', ['attention', 'working memory', 'executive function', 'plasticity']],
    ['Training Attention', ['focus blocks', 'distraction logs', 'single-task drills', 'meditation']],
    ['Learning Faster', ['spaced repetition', 'retrieval practice', 'interleaving', 'elaboration']],
    ['Brain-Healthy Lifestyle', ['sleep', 'exercise', 'nutrition', 'social connection']],
    ['Measuring Gains', ['baseline tests', 'weekly challenges', 'journals', 'plateaus']],
  ],
  '11': [
    ['Focus Myths', ['multitasking', 'willpower only', 'longer is better', 'perfect silence']],
    ['Deep Work Blocks', ['time boxing', 'environment design', 'entry rituals', 'exit rituals']],
    ['Attention Residue', ['task switching cost', 'buffers', 'batching', 'notification rules']],
    ['Energy Management', ['ultradian rhythms', 'caffeine timing', 'naps', 'movement breaks']],
    ['Focus Under Noise', ['selective attention', 'anchor cues', 'stress arousal', 'recovery']],
  ],
  '12': [
    ['Elite Mental Models', ['first principles', 'second-order thinking', 'inversion', 'probabilistic']],
    ['Pressure Performance', ['clutch routines', 'breathing', 'self-talk', 'acceptance']],
    ['Decision Quality', ['premortems', 'checklists', 'bias traps', 'feedback loops']],
    ['Cognitive Endurance', ['session length', 'fuel', 'deliberate rest', 'sleep banking']],
    ['Career & Competition', ['deliberate practice', 'coaching', 'review cycles', 'identity']],
  ],
  '13': [
    ['Memory Systems', ['encoding', 'storage', 'retrieval', 'forgetting curve']],
    ['Mnemonics', ['memory palace', 'linking', 'chunking', 'acronyms']],
    ['Study Protocols', ['active recall', 'spaced schedules', 'teaching others', 'sleep after learning']],
    ['Everyday Memory', ['names', 'lists', 'places', 'habits as anchors']],
    ['Advanced Practice', ['Anki workflows', 'competition memory', 'story methods', 'review audits']],
  ],
  '14': [
    ['Habit Science', ['cue routine reward', 'identity', 'friction', 'environment']],
    ['Morning Systems', ['wake routine', 'movement', 'planning', 'phone delay']],
    ['Keystone Habits', ['sleep', 'exercise', 'reading', 'reflection']],
    ['Breaking Bad Loops', ['replacement habits', 'urge surfing', 'accountability', 'relapse']],
    ['Weekly Design', ['theme days', 'reviews', 'streaks', 'minimum viable days']],
  ],
  '15': [
    ['Time Reality Check', ['time audit', 'energy map', 'priority matrix', 'calendar truths']],
    ['Planning Systems', ['daily MIT', 'weekly plan', 'time blocking', 'buffers']],
    ['Protecting Focus Time', ['meeting hygiene', 'async defaults', 'batching', 'no']],
    ['Tools That Help', ['lists', 'calendars', 'timers', 'automation']],
    ['Sustainable Pace', ['overcommitment', 'rest days', 'seasonality', 'review']],
  ],
  '16': [
    ['Leadership Foundations', ['trust', 'clarity', 'ownership', 'service']],
    ['Communication', ['listening', 'feedback', 'storytelling', 'difficult talks']],
    ['Influence Without Title', ['credibility', 'reciprocity', 'coalitions', 'framing']],
    ['Teams & Culture', ['psychological safety', 'roles', 'rituals', 'conflict']],
    ['Growing Leaders', ['delegation', 'coaching', 'succession', 'self-leadership']],
  ],
  '17': [
    ['Goals That Matter', ['values', 'outcome vs process', 'SMART+', 'horizon goals']],
    ['Breaking Goals Down', ['milestones', 'OKRs', 'projects', 'next actions']],
    ['Motivation Design', ['why statements', 'public commitment', 'rewards', 'identity']],
    ['Obstacles & Plans', ['implementation intentions', 'if-then', 'risk lists', 'support']],
    ['Review & Adjust', ['weekly scorecard', 'pivot rules', 'celebrate wins', 'long arcs']],
  ],
  '18': [
    ['Classical Limits', ['wave particle', 'uncertainty', 'quantization', 'measurement']],
    ['Superposition & Entanglement', ['qubits intuition', 'correlation', 'no cloning', 'decoherence']],
    ['Experiments That Matter', ['double slit', 'Bell tests', 'photoelectric', 'tunneling']],
    ['Quantum Tech Today', ['sensors', 'computing basics', 'cryptography', 'materials']],
    ['Thinking Clearly', ['metaphors vs math', 'pseudoscience traps', 'further learning', 'curiosity']],
  ],
  '19': [
    ['What AI Is', ['narrow vs general', 'models', 'data', 'inference']],
    ['Machine Learning Basics', ['supervised', 'unsupervised', 'reinforcement', 'overfitting']],
    ['Neural Networks', ['layers', 'features', 'training loop', 'transformers intuition']],
    ['Using AI Well', ['prompts', 'verification', 'privacy', 'workflow fit']],
    ['Ethics & Future', ['bias', 'jobs', 'safety', 'literacy']],
  ],
  '20': [
    ['Blockchain Basics', ['ledgers', 'consensus', 'hashes', 'immutability']],
    ['Cryptocurrencies', ['wallets', 'keys', 'transactions', 'fees']],
    ['Smart Contracts', ['automation', 'oracles', 'risks', 'audits']],
    ['Practical Use Cases', ['payments', 'NFTs context', 'supply chain', 'identity']],
    ['Risk & Security', ['scams', 'self-custody', 'volatility', 'regulation']],
  ],
  '21': [
    ['Thinking Like a Programmer', ['problem decomposition', 'algorithms', 'state', 'debugging']],
    ['Core Concepts', ['variables', 'control flow', 'functions', 'data structures']],
    ['Building Small Programs', ['inputs outputs', 'testing', 'errors', 'refactoring']],
    ['Working With Codebases', ['git basics', 'reading code', 'docs', 'collaboration']],
    ['Next Steps', ['project ideas', 'languages', 'practice loops', 'portfolio']],
  ],
  '22': [
    ['Data Thinking', ['questions first', 'bias', 'quality', 'privacy']],
    ['Statistics Essentials', ['distributions', 'mean median', 'correlation', 'uncertainty']],
    ['Analysis Workflow', ['collect', 'clean', 'explore', 'model']],
    ['Visualization', ['charts that work', 'storytelling', 'misleading plots', 'dashboards']],
    ['From Insight to Action', ['experiments', 'A/B tests', 'decisions', 'communication']],
  ],
  '23': [
    ['Early Civilizations', ['agriculture', 'cities', 'writing', 'empires']],
    ['Classical World', ['Greece', 'Rome', 'trade', 'ideas']],
    ['Middle Ages to Renaissance', ['faith', 'trade routes', 'science rebirth', 'exploration']],
    ['Modern Revolutions', ['industry', 'nation states', 'world wars', 'human rights']],
    ['Global Present', ['tech age', 'climate', 'interdependence', 'learning from history']],
  ],
  '24': [
    ['Why Philosophy Helps', ['clarity', 'ethics', 'meaning', 'argument']],
    ['Ancient Guides', ['Stoicism', 'Aristotle', 'Socrates', 'virtue']],
    ['Freedom & Responsibility', ['existential themes', 'choice', 'authenticity', 'anxiety']],
    ['Ethics in Practice', ['utilitarian lens', 'deontology', 'care ethics', 'dilemmas']],
    ['Living Philosophically', ['journaling', 'dialogue', 'reading', 'daily experiments']],
  ],
  '25': [
    ['Scarcity & Tradeoffs', ['opportunity cost', 'incentives', 'marginal thinking', 'trade']],
    ['Markets', ['supply demand', 'prices', 'competition', 'failures']],
    ['Money & Macro', ['inflation', 'interest', 'GDP', 'policy basics']],
    ['Work & Firms', ['productivity', 'specialization', 'wages', 'innovation']],
    ['Personal Application', ['budgets', 'career bets', 'investing literacy', 'media literacy']],
  ],
  '26': [
    ['Mind Basics', ['perception', 'learning', 'emotion', 'personality']],
    ['Motivation', ['intrinsic', 'extrinsic', 'goals', 'habits']],
    ['Social Psychology', ['norms', 'persuasion', 'bias', 'group dynamics']],
    ['Mental Health Literacy', ['stress', 'anxiety depression signals', 'help-seeking', 'stigma']],
    ['Applying Psychology', ['self-observation', 'communication', 'learning', 'kindness']],
  ],
  '27': [
    ['Founder Mindset', ['problem discovery', 'customer empathy', 'risk', 'learning velocity']],
    ['Idea to Offer', ['value proposition', 'MVP', 'pricing', 'positioning']],
    ['Getting Traction', ['channels', 'stories', 'sales basics', 'retention']],
    ['Operations', ['cash', 'legal basics', 'hiring', 'systems']],
    ['Scaling Wisely', ['metrics', 'culture', 'fundraising context', 'founder health']],
  ],
  '28': [
    ['Money Map', ['income', 'expenses', 'assets', 'liabilities']],
    ['Budgeting That Sticks', ['zero-based', 'percent rules', 'automation', 'buffers']],
    ['Debt & Credit', ['interest', 'paydown order', 'credit score', 'avoid traps']],
    ['Saving & Emergency', ['runway', 'sinking funds', 'goals', 'insurance basics']],
    ['Building Wealth Habits', ['pay yourself first', 'reviews', 'partners', 'long game']],
  ],
  '29': [
    ['Investor Mindset', ['risk return', 'time horizon', 'behavior gaps', 'goals']],
    ['Asset Classes', ['stocks', 'bonds', 'cash', 'alternatives']],
    ['Portfolio Design', ['diversification', 'allocation', 'rebalancing', 'costs']],
    ['Research Basics', ['fundamentals', 'index funds', 'due diligence', 'noise']],
    ['Discipline', ['plans', 'market cycles', 'taxes basics', 'avoiding scams']],
  ],
  '30': [
    ['Creative Confidence', ['permission', 'quantity', 'play', 'fear']],
    ['Idea Generation', ['SCAMPER', 'constraints', 'analogies', 'mashups']],
    ['Divergent to Convergent', ['widen', 'cluster', 'criteria', 'prototype']],
    ['Creative Habits', ['daily practice', 'inputs', 'walks', 'capture systems']],
    ['Shipping Creative Work', ['feedback', 'iteration', 'deadlines', 'portfolio']],
  ],
  '31': [
    ['Visual Foundations', ['composition', 'color', 'contrast', 'hierarchy']],
    ['Digital Tools', ['layers', 'brushes', 'vectors vs raster', 'file hygiene']],
    ['From Sketch to Piece', ['thumbnails', 'values', 'detail last', 'critique']],
    ['Style & Voice', ['references', 'studies', 'constraints', 'series']],
    ['Sharing Work', ['process posts', 'platforms', 'client basics', 'practice plan']],
  ],
  '32': [
    ['Clarity First', ['audience', 'purpose', 'message', 'structure']],
    ['Sentences That Work', ['verbs', 'cut fluff', 'rhythm', 'read aloud']],
    ['Forms of Writing', ['essay', 'email', 'story', 'explainers']],
    ['Revision Craft', ['drafts', 'feedback', 'editing passes', 'style guide']],
    ['Writing Practice', ['daily pages', 'prompts', 'publishing', 'voice']],
  ],
  '33': [
    ['Attachment & Connection', ['secure base', 'patterns', 'needs', 'repair']],
    ['Communication Skills', ['I statements', 'listening', 'conflict', 'boundaries']],
    ['Trust & Intimacy', ['reliability', 'vulnerability', 'appreciation', 'time']],
    ['Hard Moments', ['jealousy', 'distance', 'apologies', 'when to pause']],
    ['Healthy Relating', ['self-respect', 'friendship', 'chosen family', 'growth']],
  ],
  '34': [
    ['Parenting Stance', ['warmth', 'structure', 'curiosity', 'modeling']],
    ['Ages & Stages', ['toddlers', 'school age', 'teens', 'individual differences']],
    ['Discipline as Teaching', ['natural consequences', 'routines', 'calm firmness', 'repair']],
    ['Emotional Coaching', ['name feelings', 'co-regulation', 'screens', 'sleep']],
    ['Family Systems', ['partner alignment', 'self-care', 'community', 'values']],
  ],
  '35': [
    ['Why Less', ['attention', 'space', 'money', 'calm']],
    ['Declutter Method', ['categories', 'keep criteria', 'finish zones', 'donate']],
    ['Digital Minimalism', ['apps', 'inbox', 'notifications', 'media diet']],
    ['Buying Less', ['wait rules', 'quality', 'one in one out', 'wishlist']],
    ['Living Light', ['routines', 'travel', 'home reset', 'identity']],
  ],
  '36': [
    ['Inner Life', ['meaning', 'values', 'awe', 'silence']],
    ['Practices', ['meditation', 'prayer or reflection', 'journaling', 'service']],
    ['Shadow & Growth', ['honesty', 'forgiveness', 'grief', 'integration']],
    ['Community', ['teachers', 'sangha', 'rituals', 'ethics']],
    ['Everyday Sacred', ['attention', 'gratitude', 'nature', 'consistency']],
  ],
  '37': [
    ['Shared Threads', ['impermanence', 'compassion', 'discipline', 'inquiry']],
    ['Buddhism Essentials', ['four truths', 'eightfold path', 'meditation', 'ethics']],
    ['Tao & Wu Wei', ['flow', 'balance', 'simplicity', 'paradox']],
    ['Confucian Practice', ['relationships', 'ritual', 'self-cultivation', 'duty']],
    ['Modern Application', ['work', 'conflict', 'health', 'study']],
  ],
  '38': [
    ['Mindfulness Anywhere', ['breath anchors', 'transitions', 'waiting', 'commutes']],
    ['Body in Daily Life', ['posture', 'eating', 'walking', 'tension scans']],
    ['Mindful Communication', ['listening', 'pausing', 'kind speech', 'online']],
    ['Home & Work', ['morning', 'desk', 'evening wind-down', 'screens']],
    ['Keeping It Alive', ['tiny practices', 'reminders', 'partners', 'reset days']],
  ],
  '39': [
    ['Brain Learning Basics', ['synapses', 'networks', 'attention gates', 'memory traces']],
    ['Encoding Better', ['salience', 'emotion', 'multisensory', 'prior knowledge']],
    ['Consolidation', ['sleep', 'spacing', 'reconsolidation', 'practice']],
    ['Transfer & Expertise', ['schemas', 'deliberate practice', 'feedback', 'chunking']],
    ['Learning Systems', ['curriculum design', 'testing effect', 'errors', 'motivation']],
  ],
  '40': [
    ['Consciousness Questions', ['hard problem', 'attention', 'self model', 'experience']],
    ['Physics Metaphors', ['observer', 'information', 'measurement', 'limits of analogy']],
    ['Cognitive Science View', ['predictive brain', 'binding', 'workspace', 'levels']],
    ['Practice & Awareness', ['meditation research', 'altered states', 'careful claims', 'ethics']],
    ['Living With Mystery', ['curiosity', 'rigor', 'humility', 'further reading']],
  ],
  '41': [
    ['What Biohacking Is', ['measurement', 'experiments', 'risk', 'evidence']],
    ['Sleep Optimization', ['timing', 'light', 'temperature', 'caffeine']],
    ['Training & Recovery', ['HRV', 'load', 'nutrition', 'stress']],
    ['Cognitive Tools', ['nootropics caution', 'focus environment', 'learning', 'breaks']],
    ['Safe Experimentation', ['baselines', 'one variable', 'medical care', 'sustainability']],
  ],
  '42': [
    ['Tech Waves', ['compute', 'connectivity', 'biotech', 'energy']],
    ['AI & Automation', ['agents', 'robots', 'work change', 'skills']],
    ['Health Tech', ['wearables', 'genomics', 'telemedicine', 'privacy']],
    ['Climate & Materials', ['storage', 'new materials', 'cities', 'adaptation']],
    ['Being Future-Ready', ['literacy', 'ethics', 'adaptability', 'community']],
  ],
  '43': [
    ['Performance Pillars', ['skill', 'body', 'mind', 'recovery']],
    ['Deliberate Practice', ['stretch zone', 'feedback', 'reps', 'coaching']],
    ['Environment Design', ['cues', 'tools', 'peers', 'constraints']],
    ['Stress & Mastery', ['arousal curve', 'pressure training', 'routines', 'confidence']],
    ['Sustainable Excellence', ['seasons', 'identity', 'health', 'legacy']],
  ],
  '44': [
    ['Cognitive Stack', ['attention', 'memory', 'reasoning', 'creativity']],
    ['Training Protocols', ['dual n-back caution', 'domain practice', 'spaced learning', 'teaching']],
    ['Lifestyle Amplifiers', ['sleep', 'exercise', 'nutrition', 'social']],
    ['Tools & Tech', ['note systems', 'AI assistants', 'timers', 'trackers']],
    ['Long Game', ['compounding', 'plateaus', 'health checks', 'purpose']],
  ],
  '45': [
    ['Creative Identity', ['permission', 'taste', 'curiosity', 'courage']],
    ['Idea Engines', ['inputs', 'constraints', 'combinatorial play', 'questions']],
    ['Craft & Skill', ['fundamentals', 'deliberate drills', 'mentors', 'critique']],
    ['Shipping & Audience', ['deadlines', 'series', 'feedback loops', 'resilience']],
    ['Creative Life Design', ['rituals', 'rest', 'collaboration', 'legacy projects']],
  ],
  '46': [
    ['Wealth Definitions', ['freedom', 'options', 'security', 'values']],
    ['Earn & Grow', ['skills', 'career leverage', 'side projects', 'reputation']],
    ['Save & Invest', ['rate', 'automation', 'assets', 'costs']],
    ['Protect & Plan', ['insurance', 'emergency', 'taxes basics', 'estate basics']],
    ['Mindset & Longevity', ['behavior', 'patience', 'community', 'giving']],
  ],
  '47': [
    ['Vision & Truth', ['life audit', 'values', 'vision', 'honesty']],
    ['Body Foundation', ['sleep', 'movement', 'food', 'stress']],
    ['Mind & Skills', ['learning plan', 'focus', 'emotional skills', 'craft']],
    ['Relationships & Work', ['boundaries', 'contribution', 'career path', 'money']],
    ['90-Day Blueprint', ['themes', 'weekly reviews', 'metrics', 'restart rules']],
  ],
};

const TOPIC_ANGLES = [
  ['why it matters', 'how it shows up', 'first drill', 'trap to avoid'],
  ['core idea', 'daily cue', 'measure progress', 'stretch version'],
  ['plain definition', 'real-world example', '2-minute practice', 'common failure'],
  ['mental model', 'environment design', 'feedback loop', 'keep it small'],
];

function titleCase(s) {
  return s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function sectionForTopic(topic, index, bookTitle, chapterTitle) {
  const angles = TOPIC_ANGLES[index % TOPIC_ANGLES.length];
  const name = titleCase(topic);
  const intros = [
    `In **${chapterTitle}**, ${topic} is a practical lever — something you can train this week inside **${bookTitle}**.`,
    `Think of **${topic}** as a repeatable skill, not a mood. This section of **${chapterTitle}** shows where it lives in real life.`,
    `**${name}** matters most when conditions are imperfect. Use these cues to spot and practice it inside **${bookTitle}**.`,
    `Here is a clean way to work with **${topic}**: understand it, notice it, practice a tiny version, then review.`,
  ];
  const lines = [
    `**${index + 1}. ${name}**`,
    ``,
    intros[index % intros.length],
    ``,
    `• **${titleCase(angles[0])}:** ${topic} improves decisions when life is noisy — start by noticing one moment today where it would have helped.`,
    `• **${titleCase(angles[1])}:** Look for ${topic} in the next conversation, workout, study block, or commute. Name it out loud once.`,
    `• **${titleCase(angles[2])}:** Spend **5–10 minutes** practicing ${topic} on purpose. Keep a one-line note: what you did and what changed.`,
    `• **${titleCase(angles[3])}:** People overcomplicate ${topic}. Prefer a tiny version you can repeat over a dramatic version you abandon.`,
  ];
  return lines.join('\n');
}

function chapterBody(bookTitle, chapterTitle, bullets, chapterIndex, total) {
  const openers = [
    `Welcome to **${chapterTitle}**. This chapter of **${bookTitle}** is designed to be read slowly and used immediately.`,
    `You are on chapter **${chapterIndex} of ${total}**. Aim for one useful change, not a perfect finish.`,
    `Skim the section titles first, then return to the one that feels most relevant to your week.`,
  ].join('\n\n');

  const intention = `**Set an intention**
Before you scroll, finish this sentence: *After reading, I will practice __________ for __________ minutes.* Keep it small enough to succeed on a busy day.`;

  const sections = bullets.map((b, i) => sectionForTopic(b, i, bookTitle, chapterTitle)).join('\n\n');

  const bridge = `**How the pieces connect**
These ideas work best as a sequence: notice → practice once → review → slightly harder next time. If you only remember one thing from **${chapterTitle}**, remember to close the loop with a short review.`;

  const practice = `**Practice Block**
1. Pick **one** topic from this chapter — the one that creates mild resistance.
2. Schedule a specific time and place within the next 24 hours.
3. Run a minimum version (5 minutes counts).
4. Write one sentence: what worked, what blocked you.
5. Adjust the environment (tools, reminders, people) before the next attempt.
6. Repeat for three days before deciding it "doesn't work."

**Weekly Integration**
• Mon–Wed: same small drill
• Thu: remove one friction
• Fri: teach the idea in two minutes or journal it
• Weekend: light review or rest

**Reflection Prompts**
• If I applied this for seven days, what would improve first?
• What excuse shows up, and what is a kinder, accurate reframe?
• Which signal proves progress: energy, focus, mood, output, or relationships?
• What is the version I can still do on a hard day?

**Key Takeaways**
• Prefer **clarity** over intensity.
• Prefer **consistency** over heroic sessions.
• Prefer **environment design** over raw willpower.
• Prefer **review** over guessing.
• Carry **one habit** into the next chapter so learning stacks.`;

  return `${openers}\n\n${intention}\n\n${sections}\n\n${bridge}\n\n${practice}`;
}

function estimatePages(chapters) {
  const words = chapters.reduce((s, c) => s + c.content.trim().split(/\s+/).length, 0);
  return Math.max(28, Math.ceil(words / 150));
}

function buildCatalog() {
  const entries = {};
  for (const book of BOOKS) {
    const outline = OUTLINES[book.id];
    if (!outline) throw new Error(`Missing outline for ${book.id}`);
    const chapters = outline.map(([title, bullets], idx) => ({
      id: idx + 1,
      title,
      content: chapterBody(book.title, title, bullets, idx + 1, outline.length),
    }));
    entries[book.id] = {
      id: book.id,
      title: book.title,
      category: book.category,
      isPremium: book.premium,
      price: book.price,
      pages: estimatePages(chapters),
      chapters,
    };
  }
  return { BOOKS, entries };
}

function escapeTs(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function main() {
  const { BOOKS: meta, entries } = buildCatalog();
  const outDir = path.join(__dirname, '..', 'lib', 'ebookContent');
  fs.mkdirSync(outDir, { recursive: true });

  let body = `import type { EbookChapter } from '../../components/ebooks/EbookReader';\n\n`;
  body += `export type EbookContent = {\n  id: string;\n  title: string;\n  category: string;\n  isPremium: boolean;\n  price: number;\n  pages: number;\n  chapters: EbookChapter[];\n};\n\n`;
  body += `export const EBOOK_CATALOG: Record<string, EbookContent> = {\n`;

  for (const book of meta) {
    const e = entries[book.id];
    body += `  '${e.id}': {\n`;
    body += `    id: '${e.id}',\n`;
    body += `    title: ${JSON.stringify(e.title)},\n`;
    body += `    category: ${JSON.stringify(e.category)},\n`;
    body += `    isPremium: ${e.isPremium},\n`;
    body += `    price: ${e.price},\n`;
    body += `    pages: ${e.pages},\n`;
    body += `    chapters: [\n`;
    for (const ch of e.chapters) {
      body += `      {\n`;
      body += `        id: ${ch.id},\n`;
      body += `        title: ${JSON.stringify(ch.title)},\n`;
      body += `        content: \`${escapeTs(ch.content)}\`,\n`;
      body += `      },\n`;
    }
    body += `    ],\n`;
    body += `  },\n`;
  }
  body += `};\n\n`;
  body += `export function getEbookContent(id: string): EbookContent | null {\n`;
  body += `  return EBOOK_CATALOG[id] ?? null;\n`;
  body += `}\n\n`;
  body += `export function listEbookMeta() {\n`;
  body += `  return Object.values(EBOOK_CATALOG).map(({ id, title, category, isPremium, price, pages }) => ({\n`;
  body += `    id, title, category, isPremium, price, pages,\n`;
  body += `  }));\n`;
  body += `}\n`;

  const outPath = path.join(outDir, 'catalog.ts');
  fs.writeFileSync(outPath, body, 'utf8');
  console.log('Wrote', outPath, 'books:', meta.length, 'bytes:', body.length);
}

main();
