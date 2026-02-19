-- ===================================================
-- 100+ קטגוריות ראשוניות למערכת
-- ===================================================

-- הכנסות (Income Categories)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('הכנסות', 'Income', 'income', '💰', '#10B981', true, NULL),
('משכורת', 'Salary', 'income', '💼', '#10B981', true, NULL),
('עבודה עצמאית', 'Freelance', 'income', '💻', '#10B981', true, NULL),
('השקעות', 'Investments', 'income', '📈', '#10B981', true, NULL),
('דיבידנדים', 'Dividends', 'income', '💵', '#10B981', true, NULL),
('ריבית', 'Interest', 'income', '💹', '#10B981', true, NULL),
('שכר דירה', 'Rental Income', 'income', '🏢', '#10B981', true, NULL),
('מתנות', 'Gifts Received', 'income', '🎁', '#10B981', true, NULL),
('החזרים', 'Refunds', 'income', '🔄', '#10B981', true, NULL),
('מענקים', 'Grants', 'income', '🏆', '#10B981', true, NULL),
('פרסים', 'Prizes', 'income', '🎖️', '#10B981', true, NULL),
('בונוס', 'Bonus', 'income', '🎯', '#10B981', true, NULL);

-- דיור (Housing)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('דיור', 'Housing', 'expense', '🏠', '#EF4444', true, NULL);

INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'שכר דירה', 'Rent', 'expense', '🏡', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'משכנתא', 'Mortgage', 'expense', '🏦', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ועד בית', 'HOA Fees', 'expense', '🏢', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ארנונה', 'Property Tax', 'expense', '🏛️', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'חשמל', 'Electricity', 'expense', '💡', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'מים', 'Water', 'expense', '💧', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'גז', 'Gas', 'expense', '🔥', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'אינטרנט', 'Internet', 'expense', '🌐', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'טלפון', 'Phone', 'expense', '📱', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'כבלים/לוויין', 'Cable/Satellite', 'expense', '📺', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'תחזוקה ותיקונים', 'Maintenance', 'expense', '🔧', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ריהוט', 'Furniture', 'expense', '🛋️', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'כלי בית', 'Home Appliances', 'expense', '🏠', '#EF4444', true, id FROM categories WHERE name_en = 'Housing' LIMIT 1;

-- מזון (Food)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('מזון', 'Food', 'expense', '🛒', '#F59E0B', true, NULL);

INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'סופרמרקט', 'Supermarket', 'expense', '🏪', '#F59E0B', true, id FROM categories WHERE name_en = 'Food' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'שוק וירקות', 'Market/Vegetables', 'expense', '🥬', '#F59E0B', true, id FROM categories WHERE name_en = 'Food' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'בשר ועוף', 'Meat & Chicken', 'expense', '🍖', '#F59E0B', true, id FROM categories WHERE name_en = 'Food' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'מאפייה', 'Bakery', 'expense', '🍞', '#F59E0B', true, id FROM categories WHERE name_en = 'Food' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'חלבי', 'Dairy', 'expense', '🥛', '#F59E0B', true, id FROM categories WHERE name_en = 'Food' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'מסעדות', 'Restaurants', 'expense', '🍽️', '#F59E0B', true, id FROM categories WHERE name_en = 'Food' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'משלוחים', 'Food Delivery', 'expense', '🛵', '#F59E0B', true, id FROM categories WHERE name_en = 'Food' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'קפה ומאפים', 'Coffee & Pastries', 'expense', '☕', '#F59E0B', true, id FROM categories WHERE name_en = 'Food' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'פאסט פוד', 'Fast Food', 'expense', '🍔', '#F59E0B', true, id FROM categories WHERE name_en = 'Food' LIMIT 1;

-- תחבורה (Transportation)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('תחבורה', 'Transportation', 'expense', '🚗', '#3B82F6', true, NULL);

INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'דלק', 'Fuel', 'expense', '⛽', '#3B82F6', true, id FROM categories WHERE name_en = 'Transportation' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'חניה', 'Parking', 'expense', '🅿️', '#3B82F6', true, id FROM categories WHERE name_en = 'Transportation' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'תחבורה ציבורית', 'Public Transport', 'expense', '🚌', '#3B82F6', true, id FROM categories WHERE name_en = 'Transportation' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'מוניות', 'Taxis', 'expense', '🚕', '#3B82F6', true, id FROM categories WHERE name_en = 'Transportation' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'רכב שיתופי', 'Ride Share', 'expense', '🚙', '#3B82F6', true, id FROM categories WHERE name_en = 'Transportation' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ביטוח רכב', 'Car Insurance', 'expense', '🛡️', '#3B82F6', true, id FROM categories WHERE name_en = 'Transportation' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'טיפולים ותיקונים', 'Car Maintenance', 'expense', '🔧', '#3B82F6', true, id FROM categories WHERE name_en = 'Transportation' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'רישוי ובדיקות', 'Registration & Tests', 'expense', '📋', '#3B82F6', true, id FROM categories WHERE name_en = 'Transportation' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'שטיפת רכב', 'Car Wash', 'expense', '🧽', '#3B82F6', true, id FROM categories WHERE name_en = 'Transportation' LIMIT 1;

-- בריאות (Health)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('בריאות', 'Health', 'expense', '⚕️', '#EC4899', true, NULL);

INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ביטוח בריאות', 'Health Insurance', 'expense', '🏥', '#EC4899', true, id FROM categories WHERE name_en = 'Health' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'תרופות', 'Medications', 'expense', '💊', '#EC4899', true, id FROM categories WHERE name_en = 'Health' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'רופאים ומומחים', 'Doctors & Specialists', 'expense', '👨‍⚕️', '#EC4899', true, id FROM categories WHERE name_en = 'Health' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'שיניים', 'Dental', 'expense', '🦷', '#EC4899', true, id FROM categories WHERE name_en = 'Health' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'אופטיקה', 'Optometry', 'expense', '👓', '#EC4899', true, id FROM categories WHERE name_en = 'Health' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'פיזיותרפיה', 'Physical Therapy', 'expense', '💆', '#EC4899', true, id FROM categories WHERE name_en = 'Health' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'מעבדות ובדיקות', 'Labs & Tests', 'expense', '🧪', '#EC4899', true, id FROM categories WHERE name_en = 'Health' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'חדר כושר', 'Gym', 'expense', '🏋️', '#EC4899', true, id FROM categories WHERE name_en = 'Health' LIMIT 1;

-- חינוך וילדים (Education & Children)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('חינוך וילדים', 'Education & Children', 'expense', '👶', '#8B5CF6', true, NULL);

INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'גן/משפחתון', 'Kindergarten', 'expense', '🏫', '#8B5CF6', true, id FROM categories WHERE name_en = 'Education & Children' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'בית ספר', 'School', 'expense', '🎓', '#8B5CF6', true, id FROM categories WHERE name_en = 'Education & Children' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'שיעורי עזר', 'Tutoring', 'expense', '📚', '#8B5CF6', true, id FROM categories WHERE name_en = 'Education & Children' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'חוגים', 'Extracurricular', 'expense', '⚽', '#8B5CF6', true, id FROM categories WHERE name_en = 'Education & Children' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'בגדי ילדים', "Children's Clothes", 'expense', '👕', '#8B5CF6', true, id FROM categories WHERE name_en = 'Education & Children' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'צעצועים', 'Toys', 'expense', '🧸', '#8B5CF6', true, id FROM categories WHERE name_en = 'Education & Children' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'חיתולים ותינוקות', 'Diapers & Baby', 'expense', '🍼', '#8B5CF6', true, id FROM categories WHERE name_en = 'Education & Children' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ספרי לימוד', 'Textbooks', 'expense', '📖', '#8B5CF6', true, id FROM categories WHERE name_en = 'Education & Children' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'השגחה/בייביסיטר', 'Babysitter', 'expense', '👪', '#8B5CF6', true, id FROM categories WHERE name_en = 'Education & Children' LIMIT 1;

-- ביגוד והנעלה (Clothing & Footwear)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('ביגוד והנעלה', 'Clothing & Footwear', 'expense', '👔', '#06B6D4', true, NULL);

INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ביגוד', 'Clothing', 'expense', '👗', '#06B6D4', true, id FROM categories WHERE name_en = 'Clothing & Footwear' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'נעליים', 'Shoes', 'expense', '👞', '#06B6D4', true, id FROM categories WHERE name_en = 'Clothing & Footwear' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'אביזרים', 'Accessories', 'expense', '👜', '#06B6D4', true, id FROM categories WHERE name_en = 'Clothing & Footwear' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'כביסה וניקוי יבש', 'Laundry & Dry Cleaning', 'expense', '🧺', '#06B6D4', true, id FROM categories WHERE name_en = 'Clothing & Footwear' LIMIT 1;

-- דת ומצוות (Religion & Mitzvot)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('דת ומצוות', 'Religion & Mitzvot', 'expense', '✡️', '#F59E0B', true, NULL);

INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'מעשר', 'Maaser', 'expense', '💝', '#F59E0B', true, id FROM categories WHERE name_en = 'Religion & Mitzvot' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'צדקה', 'Charity', 'expense', '🤲', '#F59E0B', true, id FROM categories WHERE name_en = 'Religion & Mitzvot' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'כשרות', 'Kosher Certification', 'expense', '✅', '#F59E0B', true, id FROM categories WHERE name_en = 'Religion & Mitzvot' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ספרים דתיים', 'Religious Books', 'expense', '📖', '#F59E0B', true, id FROM categories WHERE name_en = 'Religion & Mitzvot' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'בית כנסת', 'Synagogue', 'expense', '🕍', '#F59E0B', true, id FROM categories WHERE name_en = 'Religion & Mitzvot' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'חגים', 'Holidays', 'expense', '🕯️', '#F59E0B', true, id FROM categories WHERE name_en = 'Religion & Mitzvot' LIMIT 1;

-- בילויים ופנאי (Entertainment & Leisure)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('בילויים ופנאי', 'Entertainment & Leisure', 'expense', '🎭', '#14B8A6', true, NULL);

INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'קולנוע/תיאטרון', 'Cinema/Theater', 'expense', '🎬', '#14B8A6', true, id FROM categories WHERE name_en = 'Entertainment & Leisure' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ספורט/כושר', 'Sports/Fitness', 'expense', '🏋️', '#14B8A6', true, id FROM categories WHERE name_en = 'Entertainment & Leisure' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ספרים ומגזינים', 'Books & Magazines', 'expense', '📚', '#14B8A6', true, id FROM categories WHERE name_en = 'Entertainment & Leisure' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'חופשות/טיולים', 'Vacations/Trips', 'expense', '✈️', '#14B8A6', true, id FROM categories WHERE name_en = 'Entertainment & Leisure' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'מנויים דיגיטליים', 'Digital Subscriptions', 'expense', '📱', '#14B8A6', true, id FROM categories WHERE name_en = 'Entertainment & Leisure' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'משחקים', 'Games', 'expense', '🎮', '#14B8A6', true, id FROM categories WHERE name_en = 'Entertainment & Leisure' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'אירועים', 'Events', 'expense', '🎉', '#14B8A6', true, id FROM categories WHERE name_en = 'Entertainment & Leisure' LIMIT 1;

-- אישי וטיפוח (Personal & Grooming)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('אישי וטיפוח', 'Personal & Grooming', 'expense', '💇', '#EC4899', true, NULL);

INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ספר/מספרה', 'Haircut/Barber', 'expense', '💈', '#EC4899', true, id FROM categories WHERE name_en = 'Personal & Grooming' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'קוסמטיקה', 'Cosmetics', 'expense', '💄', '#EC4899', true, id FROM categories WHERE name_en = 'Personal & Grooming' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'בושם', 'Perfume', 'expense', '🧴', '#EC4899', true, id FROM categories WHERE name_en = 'Personal & Grooming' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ספא/מסאז׳', 'Spa/Massage', 'expense', '💆‍♀️', '#EC4899', true, id FROM categories WHERE name_en = 'Personal & Grooming' LIMIT 1;

-- ביטוחים (Insurance)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('ביטוחים', 'Insurance', 'expense', '🛡️', '#3B82F6', true, NULL);

INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ביטוח חיים', 'Life Insurance', 'expense', '🏥', '#3B82F6', true, id FROM categories WHERE name_en = 'Insurance' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ביטוח דירה', 'Home Insurance', 'expense', '🏠', '#3B82F6', true, id FROM categories WHERE name_en = 'Insurance' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'ביטוח רכוש', 'Property Insurance', 'expense', '📦', '#3B82F6', true, id FROM categories WHERE name_en = 'Insurance' LIMIT 1;

-- אחר (Other)
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) VALUES
('אחר', 'Other', 'expense', '📦', '#6B7280', true, NULL);

INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'מתנות', 'Gifts', 'expense', '🎁', '#6B7280', true, id FROM categories WHERE name_en = 'Other' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'משפטי/עורך דין', 'Legal/Attorney', 'expense', '⚖️', '#6B7280', true, id FROM categories WHERE name_en = 'Other' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'בנק/עמלות', 'Bank/Fees', 'expense', '🏦', '#6B7280', true, id FROM categories WHERE name_en = 'Other' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'חיות מחמד', 'Pets', 'expense', '🐕', '#6B7280', true, id FROM categories WHERE name_en = 'Other' LIMIT 1;
INSERT INTO categories (name_he, name_en, type, icon, color, is_system, parent_id) 
SELECT 'תרומות', 'Donations', 'expense', '❤️', '#6B7280', true, id FROM categories WHERE name_en = 'Other' LIMIT 1;
