const fs = require('fs');
const path = require('path');

const BOOKS = [
  { id: '1', title: 'Mindful Living Guide', price: 20 },
  { id: '2', title: 'Stress Management', price: 20 },
  { id: '3', title: 'Advanced Meditation Techniques', price: 21 },
  { id: '4', title: 'Mind-Body Connection', price: 20 },
  { id: '5', title: 'Holistic Health & Wellness', price: 21 },
  { id: '6', title: 'Physical Training Fundamentals', price: 24 },
  { id: '7', title: 'Elite Performance Training', price: 42 },
  { id: '8', title: 'Nutrition Basics', price: 18 },
  { id: '9', title: 'Advanced Nutrition Science', price: 40 },
  { id: '10', title: 'Cognitive Enhancement', price: 38 },
  { id: '11', title: 'Mastering Focus & Concentration', price: 40 },
  { id: '12', title: 'Elite Mental Performance', price: 44 },
  { id: '13', title: 'Memory Mastery', price: 42 },
  { id: '14', title: 'Daily Habits for Success', price: 18 },
  { id: '15', title: 'Time Management Mastery', price: 20 },
  { id: '16', title: 'Leadership & Influence', price: 42 },
  { id: '17', title: 'Goal Setting & Achievement', price: 38 },
  { id: '18', title: 'Quantum Physics Basics', price: 44 },
  { id: '19', title: 'Artificial Intelligence Fundamentals', price: 42 },
  { id: '20', title: 'Blockchain & Cryptocurrency', price: 40 },
  { id: '21', title: 'Programming Fundamentals', price: 38 },
  { id: '22', title: 'Data Science Essentials', price: 40 },
  { id: '23', title: 'World History Essentials', price: 18 },
  { id: '24', title: 'Philosophy for Modern Life', price: 42 },
  { id: '25', title: 'Economics Fundamentals', price: 38 },
  { id: '26', title: 'Psychology Basics', price: 40 },
  { id: '27', title: 'Entrepreneurship Guide', price: 44 },
  { id: '28', title: 'Personal Finance Mastery', price: 38 },
  { id: '29', title: 'Investment Strategies', price: 46 },
  { id: '30', title: 'Creative Thinking', price: 36 },
  { id: '31', title: 'Digital Art Fundamentals', price: 38 },
  { id: '32', title: 'Writing Mastery', price: 38 },
  { id: '33', title: 'Relationship Psychology', price: 38 },
  { id: '34', title: 'Parenting Essentials', price: 40 },
  { id: '35', title: 'Minimalism & Decluttering', price: 18 },
  { id: '36', title: 'Spiritual Growth', price: 40 },
  { id: '37', title: 'Eastern Philosophy', price: 40 },
  { id: '38', title: 'Mindfulness in Daily Life', price: 20 },
  { id: '39', title: 'Neuroscience of Learning', price: 48 },
  { id: '40', title: 'Quantum Consciousness', price: 46 },
  { id: '41', title: 'Biohacking Fundamentals', price: 44 },
  { id: '42', title: 'Future Technologies', price: 42 },
  { id: '43', title: 'Elite Performance Mastery', price: 52 },
  { id: '44', title: 'Advanced Cognitive Enhancement', price: 54 },
  { id: '45', title: 'Creative Genius Unleashed', price: 50 },
  { id: '46', title: 'Wealth Building Mastery', price: 52 },
  { id: '47', title: 'Life Transformation Blueprint', price: 50 },
];

const values = BOOKS.map((b) => {
  const title = b.title.replace(/'/g, "''");
  return `  ('${b.id}', '${title}', ${b.price}, 'available')`;
}).join(',\n');

const sql = `begin;

insert into public.ebook_catalog (id, title, price, status) values
${values}
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  status = excluded.status;

commit;
`;

const out = path.join(__dirname, '..', 'supabase', 'migrations', '202609300001_all_ebooks_catalog.sql');
fs.writeFileSync(out, sql);
console.log('Wrote', out);
