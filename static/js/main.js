/* Nutrifit - Pure Client-Side State Engine & Calculations */

// --- LAYOUT & USER MANAGEMENT CONTROLLER ---
document.addEventListener("DOMContentLoaded", function() {
    // 1. Update Navbar actions based on localStorage
    const navUserGreeting = document.getElementById("nav-user-greeting");
    const btnLoginNav = document.getElementById("btn-login-nav");
    const btnJoinNav = document.getElementById("btn-join-nav");
    const btnLogoutNav = document.getElementById("btn-logout-nav");
    const profileGear = document.getElementById("profile-gear-icon");
    
    const savedUser = localStorage.getItem('nutrifit_user');
    if (savedUser) {
        const userObj = JSON.parse(savedUser);
        if (navUserGreeting) {
            navUserGreeting.style.display = "inline";
            const displays = document.querySelectorAll(".user-name-display");
            displays.forEach(d => d.innerText = userObj.name || 'Jiya');
        }
        if (btnLoginNav) btnLoginNav.style.display = "none";
        if (btnJoinNav) btnJoinNav.style.display = "none";
        if (btnLogoutNav) btnLogoutNav.style.display = "inline-block";
        if (profileGear) profileGear.style.display = "flex";
    } else {
        if (navUserGreeting) navUserGreeting.style.display = "none";
        if (btnLoginNav) btnLoginNav.style.display = "inline-block";
        if (btnJoinNav) btnJoinNav.style.display = "inline-block";
        if (btnLogoutNav) btnLogoutNav.style.display = "none";
        if (profileGear) profileGear.style.display = "none";
    }

    // 2. Active nav link highlighting based on current file name
    const urlParts = window.location.pathname.split("/");
    let currentPath = urlParts[urlParts.length - 1] || "index.html";
    if (currentPath === "") currentPath = "index.html";
    
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPath) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
    
    // 3. Hero buttons on index.html
    const heroBtns = document.getElementById("hero-buttons-container");
    if (heroBtns) {
        if (savedUser) {
            heroBtns.innerHTML = `
                <a href="dashboard.html" class="btn btn-primary">Go to Dashboard <i class="fa-solid fa-arrow-right"></i></a>
                <a href="wellness.html" class="btn btn-outline">Explore Wellness Vault</a>
            `;
        } else {
            heroBtns.innerHTML = `
                <a href="login.html" class="btn btn-primary">Get Started Free</a>
                <a href="login.html" class="btn btn-outline">Sign In</a>
            `;
        }
    }

    // 4. Page Routing & View Initializer
    if (currentPath === "dashboard.html") {
        initDashboardView();
    } else if (currentPath === "onboarding.html") {
        initOnboardingView();
    } else if (currentPath === "experts.html") {
        initExpertsView();
    } else if (currentPath === "wellness.html") {
        initWellnessView();
    }
});

function logoutUser(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('nutrifit_user');
    localStorage.removeItem('nutrifit_cycle_logs');
    localStorage.removeItem('nutrifit_appointments');
    window.location.href = "index.html";
}

// --- 1. SEEDED RECIPES DATABASE ---
const RECIPES_DB = [
    {
        name: 'Seed Cycling Chia Pudding',
        category: 'Breakfast', cuisine: 'General', diet_type: 'veg',
        image_url: 'static/images/pcos_meal.png',
        description: 'A delicious, creamy chia seed pudding loaded with pumpkin and flax seeds to support hormone regulation (specifically during the follicular phase).',
        ingredients: '2 tbsp Chia Seeds, 1/2 cup Almond Milk, 1 tbsp Pumpkin Seeds, 1 tbsp Ground Flax Seeds, 1/2 cup mixed Berries, 1 tsp Maple Syrup',
        carbs: 22.0, protein: 7.0, fat: 14.0, iron: 3.4, magnesium: 150.0, zinc: 1.8, calories: 240,
        why_pcos: 'Rich in Omega-3 fatty acids, zinc, and lignans. Helps regulate estrogen levels and supports healthy ovulation, which is vital for PCOS management.'
    },
    {
        name: 'Avocado & Spinach Scramble',
        category: 'Breakfast', cuisine: 'General', diet_type: 'veg',
        image_url: 'static/images/spinach_scramble.png',
        description: 'Fluffy scrambled eggs loaded with baby spinach and served with fresh sliced avocado for healthy fats and slow-release energy.',
        ingredients: '2 large Eggs, 1 cup Baby Spinach, 1/2 Avocado (sliced), 1 tsp Olive Oil, pinch of Salt and Black Pepper',
        carbs: 4.0, protein: 14.0, fat: 22.0, iron: 2.7, magnesium: 48.0, zinc: 1.3, calories: 270,
        why_pcos: 'Extremely low glycemic index, rich in monounsaturated fats (avocado) and iron (spinach). Helps reduce insulin resistance and inflammation.'
    },
    {
        name: 'American Blueberry & Hemp Oatmeal',
        category: 'Breakfast', cuisine: 'American', diet_type: 'veg',
        image_url: 'static/images/blueberry_oatmeal.png',
        description: 'Warm rolled oats cooked with hemp seeds for protein, topped with fresh blueberries and walnuts.',
        ingredients: '1/2 cup Rolled Oats, 1 tbsp Hemp Seeds, 1/4 cup Blueberries, 5 Walnut halves, 1 cup Water/Almond Milk',
        carbs: 27.0, protein: 9.0, fat: 10.0, iron: 2.8, magnesium: 120.0, zinc: 1.9, calories: 230,
        why_pcos: 'Hemp and walnuts provide essential omega-3 fatty acids, which lower testosterones and target PCOS-related inflammation.'
    },
    {
        name: 'Iron-Packed Indian Poha',
        category: 'Breakfast', cuisine: 'Indian', diet_type: 'veg',
        image_url: 'static/images/poha.png',
        description: 'A classic light Indian breakfast of flattened rice (poha) sautéed with peanuts, mustard seeds, curry leaves, and a heavy squeeze of vitamin C-rich lemon juice.',
        ingredients: '1 cup Flattened Rice (Poha), 1 tbsp Peanuts, 1/2 Onion, 1/4 tsp Turmeric, Curry leaves, 1 tbsp Lemon juice, 1 tsp Mustard seeds',
        carbs: 35.0, protein: 5.0, fat: 6.0, iron: 3.9, magnesium: 52.0, zinc: 1.1, calories: 210,
        why_pcos: 'Flattened rice is naturally high in iron. Pairing it with fresh lemon juice (vitamin C) dramatically increases non-heme iron absorption.'
    },
    {
        name: 'Low-GI Ragi & Oats Dosa',
        category: 'Breakfast', cuisine: 'Indian', diet_type: 'veg',
        image_url: 'static/images/ragi_dosa.png',
        description: 'Crispy South Indian crêpe made from finger millet (ragi) and ground rolled oats. Fermented, low-glycemic, and packed with minerals.',
        ingredients: '1/3 cup Ragi flour, 1/3 cup Rolled Oats (powdered), 1/4 cup Yogurt, ginger-chili paste, pinch of salt',
        carbs: 28.0, protein: 8.0, fat: 4.0, iron: 3.2, magnesium: 85.0, zinc: 1.4, calories: 180,
        why_pcos: 'Ragi (finger millet) is extremely rich in calcium and iron. It helps maintain insulin sensitivity and prevents blood glucose spikes.'
    },
    {
        name: 'Halim Seed & Date Smoothie',
        category: 'Breakfast', cuisine: 'Indian', diet_type: 'veg',
        image_url: 'static/images/pcos_smoothie.png',
        description: 'A powerhouse smoothie featuring garden cress seeds (halim), natural date sweetening, and almond milk. One of the highest plant-based sources of iron.',
        ingredients: '1 tsp Garden Cress Seeds (Halim, soaked), 2 Medjool Dates, 1 cup Almond Milk, 1 tbsp Almonds, pinch of Cinnamon',
        carbs: 32.0, protein: 6.0, fat: 8.0, iron: 5.5, magnesium: 98.0, zinc: 1.5, calories: 220,
        why_pcos: 'Halim seeds are an absolute superfood for PCOS, loaded with iron and folic acid to support regular cycles and treat anemia.'
    },
    {
        name: 'European Smoked Salmon & Sourdough',
        category: 'Breakfast', cuisine: 'European', diet_type: 'non-veg',
        image_url: 'static/images/salmon_sourdough.png',
        description: 'A slice of toasted organic sourdough topped with baby spinach, soft scrambled eggs, and slices of premium smoked salmon.',
        ingredients: '1 slice Sourdough bread, 50g Smoked Salmon, 1 large Egg, 1/2 cup Spinach, 1 tsp Capers',
        carbs: 18.0, protein: 20.0, fat: 12.0, iron: 3.2, magnesium: 54.0, zinc: 1.8, calories: 260,
        why_pcos: 'Provides high-quality heme iron and essential proteins to support early-day satiety and lower cortisol levels.'
    },
    {
        name: 'Lemon Herb Salmon & Quinoa Bowl',
        category: 'Lunch', cuisine: 'General', diet_type: 'non-veg',
        image_url: 'static/images/salmon_quinoa.png',
        description: 'Pan-seared wild salmon fillet served over a bed of fluffy quinoa, steamed broccoli, and a drizzle of olive-lemon dressing.',
        ingredients: '150g Salmon fillet, 1/2 cup cooked Quinoa, 1 cup Broccoli florets, 1 tbsp Olive Oil, Lemon juice, fresh Dill',
        carbs: 30.0, protein: 34.0, fat: 18.0, iron: 3.8, magnesium: 95.0, zinc: 2.2, calories: 420,
        why_pcos: 'Salmon is packed with anti-inflammatory Omega-3s. Quinoa is a complex carb with a low glycemic load, offering fiber to stabilize blood sugar.'
    },
    {
        name: 'Chipotle Quinoa Fajita Bowl',
        category: 'Lunch', cuisine: 'Mexican Bowls', diet_type: 'veg',
        image_url: 'static/images/quinoa_fajita.png',
        description: 'An iron-rich bowl with black beans, cooked quinoa, charred bell peppers, fajita spices, fresh avocado, and a cilantro-lime drizzle.',
        ingredients: '1/2 cup Black Beans, 1/2 cup cooked Quinoa, 1/2 cup Sliced Bell Peppers, 1/2 Avocado, 1 tsp Lime juice, 1/2 tsp Cumin',
        carbs: 45.0, protein: 11.0, fat: 16.0, iron: 4.1, magnesium: 110.0, zinc: 1.7, calories: 380,
        why_pcos: 'Combines black beans and quinoa for a complete amino acid profile. Packed with dietary fiber and magnesium to lower insulin response.'
    },
    {
        name: 'Palak Paneer with Bajra Roti',
        category: 'Lunch', cuisine: 'Indian', diet_type: 'veg',
        image_url: 'static/images/pcos_curry.png',
        description: 'A nutritious North Indian favorite: fresh paneer cubes folded into a thick, spiced puree of baby spinach (palak), served with iron-dense pearl millet (bajra) roti.',
        ingredients: '100g Paneer, 2 cups Spinach (Palak), 1 Bajra Roti, 1 clove Garlic, 1/2 tsp Ginger, ghee',
        carbs: 22.0, protein: 20.0, fat: 18.0, iron: 4.5, magnesium: 112.0, zinc: 2.4, calories: 330,
        why_pcos: 'Combining iron-rich spinach and calcium-rich paneer with low-GI pearl millet (bajra) provides a highly mineral-dense hormonal lunch.'
    },
    {
        name: 'Iron-Rich Spinach Dal & Brown Rice',
        category: 'Lunch', cuisine: 'Indian', diet_type: 'veg',
        image_url: 'static/images/spinach_dal.png',
        description: 'A traditional Indian lentil dal cooked with fresh baby spinach and cumin, served with high-fiber brown rice. Supercharged with iron.',
        ingredients: '1/2 cup Brown Lentils, 1 cup Spinach, 1/2 cup cooked Brown Rice, 1/2 tsp Cumin, 1/4 tsp Turmeric, 1 tsp Ginger, ghee',
        carbs: 48.0, protein: 14.0, fat: 5.0, iron: 4.8, magnesium: 120.0, zinc: 2.1, calories: 310,
        why_pcos: 'High-fiber and iron-dense lentil dal that prevents glucose spikes, keeping energy stable while treating iron-deficiency anemia common in PCOS.'
    },
    {
        name: 'American Turkey & Avocado Greens Salad',
        category: 'Lunch', cuisine: 'American', diet_type: 'non-veg',
        image_url: 'static/images/turkey_avocado_salad.png',
        description: 'Sliced roasted turkey breast served over romaine lettuce, cucumbers, cherry tomatoes, and sliced avocado, drizzled with olive oil.',
        ingredients: '120g Turkey breast, 2 cups romaine lettuce, 1/2 Avocado, 1/2 cup Cherry Tomatoes, 1 tbsp Extra Virgin Olive oil',
        carbs: 8.0, protein: 28.0, fat: 18.0, iron: 2.9, magnesium: 62.0, zinc: 2.1, calories: 310,
        why_pcos: 'Extremely low carb load. Lean turkey provides iron and tryptophan, helping synthesize serotonin to combat PCOS mood swings.'
    },
    {
        name: 'Mediterranean Mackerel Greek Salad',
        category: 'Lunch', cuisine: 'European', diet_type: 'non-veg',
        image_url: 'static/images/mackerel_greek_salad.png',
        description: 'Flaked omega-3 rich mackerel over a classic Greek salad of bell peppers, cucumbers, olives, onions, and feta.',
        ingredients: '100g Canned Mackerel, 1 cup Cucumber, 1/2 cup Cherry Tomatoes, 5 Kalamata Olives, 30g Feta cheese, lemon juice',
        carbs: 6.0, protein: 22.0, fat: 16.0, iron: 3.5, magnesium: 52.0, zinc: 1.8, calories: 260,
        why_pcos: 'Mackerel provides high-quality protein, heme iron, and massive omega-3 fatty acids, crucial for lowering testosterone in PCOS.'
    },
    {
        name: 'Tandoori Grilled Tofu & Veggies',
        category: 'Dinner', cuisine: 'Indian', diet_type: 'veg',
        image_url: 'static/images/grilled_tofu_veggies.png',
        description: 'Tofu cubes marinated in a spiced Greek yogurt tandoori blend and grilled to perfection with bell peppers and onions.',
        ingredients: '150g Firm Tofu, 1/2 cup Bell Peppers, 1/2 cup Onion, 3 tbsp Greek Yogurt, 1 tsp Tandoori Masala, 1 tsp Lemon juice',
        carbs: 12.0, protein: 18.0, fat: 14.0, iron: 3.5, magnesium: 78.0, zinc: 1.6, calories: 260,
        why_pcos: 'Tofu provides plant-based protein which improves insulin sensitivity. Marinating in yogurt increases digestive health and reduces bloating.'
    },
    {
        name: 'Zucchini Noodle Beef Bolognese',
        category: 'Dinner', cuisine: 'Italian', diet_type: 'non-veg',
        image_url: 'static/images/zucchini_beef_bolognese.png',
        description: 'Lean ground beef simmered in a garlic-herb marinara sauce served over fresh spiralized zucchini noodles (zoodles). High in bioavailable iron.',
        ingredients: '120g Lean Ground Beef, 2 medium Zucchinis (spiralized), 1/2 cup Tomato Purée, 2 cloves Garlic, fresh Basil, 1 tsp Olive Oil',
        carbs: 14.0, protein: 28.0, fat: 16.0, iron: 4.2, magnesium: 64.0, zinc: 4.8, calories: 340,
        why_pcos: 'Ground beef is a major source of heme iron which is easily absorbed. Zucchini noodles keep glycemic load very low.'
    },
    {
        name: 'Kala Chana & Moringa Soup',
        category: 'Dinner', cuisine: 'Indian', diet_type: 'veg',
        image_url: 'static/images/pcos_soup.png',
        description: 'A rich, earthy soup featuring iron-packed black chickpeas (kala chana) and highly nutrient-dense fresh moringa (drumstick) leaves simmered with ginger, garlic, and cumin.',
        ingredients: '1/2 cup Black Chickpeas (soaked & boiled), 1 cup fresh Moringa leaves, 1/2 Onion, 1 clove Garlic, 1 tsp Ginger, cumin, pepper',
        carbs: 32.0, protein: 10.0, fat: 4.0, iron: 5.2, magnesium: 94.0, zinc: 1.8, calories: 200,
        why_pcos: 'Black chickpeas and moringa leaves represent an outstanding double-iron vegetarian pairing, boosting hemoglobin and lowering inflammation.'
    },
    {
        name: 'Tuscan Chickpea & Kale Stew',
        category: 'Dinner', cuisine: 'Italian', diet_type: 'veg',
        image_url: 'static/images/chickpea_kale_stew.png',
        description: 'A classic Italian country stew with creamy chickpeas, baby kale, carrots, and rosemary in an anti-inflammatory garlic tomato broth.',
        ingredients: '1/2 cup Chickpeas, 1 cup Kale, 1/2 cup Diced Tomatoes, 1/2 cup Carrots, 1 clove Garlic, fresh Rosemary, 1 tsp Olive Oil',
        carbs: 38.0, protein: 12.0, fat: 8.0, iron: 3.6, magnesium: 88.0, zinc: 1.5, calories: 290,
        why_pcos: 'Chickpeas provide plant iron and fiber. Kale is packed with vitamin C, which increases non-heme iron absorption.'
    },
    {
        name: 'Til & Jaggery Energy Bites',
        category: 'Snack', cuisine: 'Indian', diet_type: 'veg',
        image_url: 'static/images/pcos_bites.png',
        description: 'Rich, mineral-dense snack balls made from toasted sesame seeds (til) and organic unrefined jaggery (gur) blended with dates.',
        ingredients: '2 tbsp Sesame Seeds (Til), 1 tbsp Organic Jaggery (Gur), 3 Medjool Dates, 5 Almonds',
        carbs: 28.0, protein: 4.0, fat: 8.0, iron: 3.2, magnesium: 64.0, zinc: 1.2, calories: 190,
        why_pcos: 'Sesame seeds (rich in zinc and lignans) and jaggery (rich in iron) combine to form a traditional cycle-syncing, sweet snack.'
    },
    {
        name: 'Dark Chocolate Pumpkin Seed Bark',
        category: 'Snack', cuisine: 'American', diet_type: 'veg',
        image_url: 'static/images/chocolate_pumpkin_bark.png',
        description: 'Decadent 85% dark chocolate melted and set with raw pumpkin seeds and sea salt. A sweet treat rich in magnesium.',
        ingredients: '40g Dark Chocolate (85% cocoa), 1 tbsp Raw Pumpkin Seeds, pinch of coarse sea salt',
        carbs: 12.0, protein: 4.0, fat: 15.0, iron: 2.5, magnesium: 95.0, zinc: 1.2, calories: 200,
        why_pcos: 'Dark chocolate and pumpkin seeds are incredibly high in magnesium, which relaxes uterine muscles and reduces PMS cramps.'
    },
    {
        name: 'Guacamole & Flax Seed Crisps',
        category: 'Snack', cuisine: 'Mexican Bowls', diet_type: 'veg',
        image_url: 'static/images/guacamole_flax_crisps.png',
        description: 'Freshly mashed avocado guacamole with onion, cilantro, and lime, served with baked seed crackers.',
        ingredients: '1/2 Avocado, 1/2 Lime, cilantro, onion, 30g Flax seed crackers',
        carbs: 10.0, protein: 4.0, fat: 18.0, iron: 2.4, magnesium: 78.0, zinc: 1.1, calories: 210,
        why_pcos: 'Rich in fiber and monounsaturated healthy fats to reduce testosterone production and keep blood sugar levels flat.'
    }
];

// --- 2. LOCALSTORAGE STATE INITIALIZATION ---
function getLocalStorageData(key, defaultVal) {
    const data = localStorage.getItem(key);
    if (!data) return defaultVal;
    try {
        return JSON.parse(data);
    } catch(e) {
        return defaultVal;
    }
}

function setLocalStorageData(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}

// Ensure a default logged-in Guest User ("Jiya") if none exists
const defaultUser = {
    username: 'guest_user',
    name: 'Jiya',
    age: 26,
    height: 162.0,
    weight: 62.0,
    diet_preference: 'veg',
    lifestyle: 'moderate',
    exercise_type: 'yoga',
    exercise_time: 30,
    cycle_days: 28,
    period_days: 5,
    last_period_date: getPastDateString(12) // starts 12 days ago
};

function getPastDateString(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
}

// Initializing state variables
let currentUser = getLocalStorageData('nutrifit_user', defaultUser);
if (!localStorage.getItem('nutrifit_user')) {
    setLocalStorageData('nutrifit_user', defaultUser);
}

let cycleLogs = getLocalStorageData('nutrifit_cycle_logs', {});
let appointmentsList = getLocalStorageData('nutrifit_appointments', [
    {
        expert_name: 'Dr. Sarah Rahman',
        expert_type: 'Gynecologist',
        appointment_date: getPastDateString(-2), // 2 days in future
        appointment_time: '11:00 AM',
        status: 'Scheduled'
    }
]);
if (!localStorage.getItem('nutrifit_appointments')) {
    setLocalStorageData('nutrifit_appointments', appointmentsList);
}

// --- 3. MEDICAL & DIET CALCULATION ENGINES ---

function calculateNutritionalProfile(user) {
    if (!user || !user.weight || !user.height) return null;
    
    const weight = user.weight;
    const height = user.height;
    const lifestyle = user.lifestyle || 'sedentary';
    
    // BMI
    const heightM = height / 100.0;
    const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
    
    let bmiClass = 'Normal Weight';
    if (bmi < 18.5) bmiClass = 'Underweight';
    else if (bmi < 24.9) bmiClass = 'Normal Weight';
    else if (bmi < 29.9) bmiClass = 'Overweight';
    else bmiClass = 'Obese';
    
    // BMR (Mifflin-St Jeor)
    const age = user.age || 26;
    const bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    
    let multiplier = 1.2;
    if (lifestyle === 'moderate') multiplier = 1.375;
    else if (lifestyle === 'active') multiplier = 1.55;
    
    const tdee = Math.round(bmr * multiplier);
    
    let targetCalories = tdee;
    if (bmi >= 25.0) {
        targetCalories = Math.max(1300, tdee - 250);
    }
    
    const carbsG = Math.round((targetCalories * 0.40) / 4);
    const proteinG = Math.round((targetCalories * 0.30) / 4);
    const fatG = Math.round((targetCalories * 0.30) / 9);
    
    return {
        bmi: bmi,
        bmi_class: bmiClass,
        tdee: tdee,
        target_calories: targetCalories,
        carbs_g: carbsG,
        protein_g: proteinG,
        fat_g: fatG,
        iron_mg: 18.0,
        magnesium_mg: 320.0,
        zinc_mg: 8.0
    };
}

function calculateCyclePhase(user) {
    if (!user || !user.last_period_date || !user.cycle_days) return null;
    
    const lastPeriod = new Date(user.last_period_date);
    const cycleLength = user.cycle_days;
    const periodLength = user.period_days || 5;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    lastPeriod.setHours(0,0,0,0);
    
    const diffTime = Math.abs(today - lastPeriod);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const currentCycleDay = (diffDays % cycleLength) + 1;
    
    let phase = 'Menstrual';
    let phaseDesc = '';
    let workout = '';
    let seedCycling = '';
    
    if (currentCycleDay <= periodLength) {
        phase = 'Menstrual';
        phaseDesc = 'Your estrogen and progesterone levels are low. Focus on rest, hydration, and restoring iron.';
        workout = 'Gentle Yoga & Light Walking';
        seedCycling = 'Flax & Pumpkin seeds (1 tbsp each)';
    } else if (currentCycleDay <= (cycleLength / 2) - 1) {
        phase = 'Follicular';
        phaseDesc = 'Estrogen starts to rise, boosting your energy and mood. Great time to plan, create, and build muscle.';
        workout = 'Strength Training & Brisk Walks';
        seedCycling = 'Flax & Pumpkin seeds (1 tbsp each)';
    } else if (currentCycleDay <= (cycleLength / 2) + 2) {
        phase = 'Ovulatory';
        phaseDesc = 'Estrogen and LH peak. You are at your highest energy and fertility window. Focus on anti-inflammatory nutrients.';
        workout = 'HIIT, Strength, or Intense Cardio';
        seedCycling = 'Sesame & Sunflower seeds (1 tbsp each)';
    } else {
        phase = 'Luteal';
        phaseDesc = 'Progesterone peaks. You may experience PMS, bloating, or energy drops. Prioritize complex carbs to balance blood sugar.';
        workout = 'Pilates, Slow Strength, or Steady Cardio';
        seedCycling = 'Sesame & Sunflower seeds (1 tbsp each)';
    }
    
    const cyclesPassed = Math.floor(diffDays / cycleLength);
    const nextPeriodDate = new Date(lastPeriod);
    nextPeriodDate.setDate(lastPeriod.getDate() + (cyclesPassed + 1) * cycleLength);
    
    const daysUntilNext = Math.round((nextPeriodDate - today) / (1000 * 60 * 60 * 24));
    
    return {
        cycle_day: currentCycleDay,
        phase: phase,
        phase_description: phaseDesc,
        recommended_workout: workout,
        seed_cycling: seedCycling,
        next_period_date: nextPeriodDate.toISOString().split('T')[0],
        days_until_next: daysUntilNext
    };
}

function getSuggestedRecipe(phase, dietPref) {
    const filtered = RECIPES_DB.filter(r => {
        const ingredientsLower = r.ingredients.toLowerCase();
        const nameLower = r.name.toLowerCase();
        
        if (dietPref === 'vegan') {
            return !['salmon', 'egg', 'milk', 'cheese', 'yogurt', 'chicken', 'meat', 'feta', 'mackerel', 'beef'].some(ap => ingredientsLower.includes(ap) || nameLower.includes(ap));
        } else if (dietPref === 'veg' || dietPref === 'vegetarian') {
            return !['salmon', 'chicken', 'meat', 'fish', 'mackerel', 'beef'].some(mp => ingredientsLower.includes(mp) || nameLower.includes(mp));
        } else if (dietPref === 'pescatarian') {
            return !['chicken', 'meat', 'beef'].some(mp => ingredientsLower.includes(mp) || nameLower.includes(mp));
        }
        return true;
    });
    
    if (filtered.length === 0) return null;
    
    if (phase === 'Menstrual') {
        const match = filtered.find(r => r.name.toLowerCase().includes('stew') || r.name.toLowerCase().includes('dal') || r.name.toLowerCase().includes('soup'));
        return match || filtered[0];
    } else if (phase === 'Follicular') {
        const match = filtered.find(r => r.name.toLowerCase().includes('chia') || r.name.toLowerCase().includes('pudding') || r.name.toLowerCase().includes('oatmeal'));
        return match || filtered[0];
    } else if (phase === 'Ovulatory') {
        const match = filtered.find(r => r.name.toLowerCase().includes('scramble') || r.name.toLowerCase().includes('salmon') || r.name.toLowerCase().includes('dosa') || r.name.toLowerCase().includes('poha'));
        return match || filtered[0];
    } else {
        const match = filtered.find(r => r.name.toLowerCase().includes('tofu') || r.name.toLowerCase().includes('bites') || r.name.toLowerCase().includes('chocolate') || r.name.toLowerCase().includes('chickpeas'));
        return match || filtered[0];
    }
}

// --- 4. FRONTEND VIEWS INITIALIZATION ---

// Draw macro doughnut chart using Chart.js API
function renderMacroChart(carbs, protein, fat) {
    const chartEl = document.getElementById('macroChart');
    if (!chartEl) return;
    const ctx = chartEl.getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Carbs (Low GI)', 'Protein', 'Healthy Fats'],
            datasets: [{
                data: [carbs, protein, fat],
                backgroundColor: [
                    '#8FA89B', // Light Sage Green
                    '#D1806A', // Terracotta
                    '#EAD8C7'  // Clay/Sand
                ],
                borderWidth: 2,
                borderColor: '#FCFAF6',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // We use our custom styled legends list
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw}g`;
                        }
                    }
                }
            },
            cutout: '75%'
        }
    });
}

// Client-side phase projection for any calendar date
function getPhaseForDate(targetDate) {
    if (!currentUser || !currentUser.last_period_date || !currentUser.cycle_days) return null;
    
    const lastPeriod = new Date(currentUser.last_period_date);
    const cycleLength = currentUser.cycle_days;
    const periodLength = currentUser.period_days || 5;
    
    const target = new Date(targetDate);
    target.setHours(0,0,0,0);
    lastPeriod.setHours(0,0,0,0);
    
    const diffTime = target - lastPeriod;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Support wrap-around for past or future dates cleanly
    let currentCycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1;
    
    if (currentCycleDay <= periodLength) {
        return 'Menstrual';
    } else if (currentCycleDay <= (cycleLength / 2) - 1) {
        return 'Follicular';
    } else if (currentCycleDay <= (cycleLength / 2) + 2) {
        return 'Ovulatory';
    } else {
        return 'Luteal';
    }
}

// Modern, beautiful Toast Notifications
function showFlashNotification(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const bgColors = {
        success: '#e2efe9',
        error: '#f8e7e4',
        warning: '#fcf6e5',
        info: '#e5eef4'
    };
    const borderColors = {
        success: '#c4dfd2',
        error: '#f1cfc9',
        warning: '#f8e8c9',
        info: '#c8dce9'
    };
    const textColors = {
        success: '#32644d',
        error: '#8f3a2c',
        warning: '#8f6a2c',
        info: '#2c5a8f'
    };
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-exclamation',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };
    
    toast.style.cssText = `
        background-color: ${bgColors[type] || bgColors.success};
        border: 1px solid ${borderColors[type] || borderColors.success};
        color: ${textColors[type] || textColors.success};
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
        animation: toastSlideIn 0.3s ease forwards;
    `;
    
    if (!document.getElementById('toast-animation-style')) {
        const style = document.createElement('style');
        style.id = 'toast-animation-style';
        style.innerHTML = `
            @keyframes toastSlideIn {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes toastFadeOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(120%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, 3000);
}

// Client-side multi-dimensional filter state
const activeFilters = {
    category: 'all',
    diet: 'all',
    cuisine: 'all'
};

function initWellnessView() {
    if (!document.getElementById("recipes-list-grid")) return;
    
    // Render all recipes
    renderRecipesList(RECIPES_DB);
    
    // Pre-fill values from current user profile if calculator forms are present
    if (currentUser) {
        const bmiW = document.getElementById("bmi-weight");
        const bmiH = document.getElementById("bmi-height");
        const bmiA = document.getElementById("bmi-age");
        if (bmiW) bmiW.value = currentUser.weight || '';
        if (bmiH) bmiH.value = currentUser.height || '';
        if (bmiA) bmiA.value = currentUser.age || 26;
    }
}

function renderRecipesList(recipes) {
    const grid = document.getElementById("recipes-list-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    if (recipes.length === 0) {
        grid.innerHTML = '<div style="grid-column: span 3; text-align: center; padding: 40px; color: var(--text-muted);">No recipes found matching the active filters.</div>';
        return;
    }
    
    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "card meal-card";
        card.setAttribute("data-category", recipe.category);
        card.setAttribute("data-diet", recipe.diet_type);
        card.setAttribute("data-cuisine", recipe.cuisine);
        card.style.padding = "0";
        
        card.innerHTML = `
            <div class="meal-img" style="background-image: url('${recipe.image_url}');">
                <span class="badge" style="font-size: 10px; padding: 4px 8px; border-radius: 8px;">${recipe.category}</span>
            </div>
            
            <div style="padding: 24px; display: flex; flex-direction: column; height: 100%;">
                <h4 style="font-size: 18px; margin-bottom: 8px;">${recipe.name}</h4>
                <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; flex-grow: 1;">${recipe.description}</p>
                
                <!-- Macro pills -->
                <div class="macro-pills">
                    <span class="pill-micro" style="background-color: rgba(95, 125, 110, 0.1); color: var(--primary-dark);">Carbs: ${recipe.carbs.toFixed(1)}g</span>
                    <span class="pill-micro" style="background-color: rgba(209, 128, 106, 0.1); color: var(--secondary-dark);">Protein: ${recipe.protein.toFixed(1)}g</span>
                    <span class="pill-micro" style="background-color: rgba(234, 216, 199, 0.4); color: var(--text-main);">Fat: ${recipe.fat.toFixed(1)}g</span>
                    <span class="pill-micro" style="background-color: var(--accent-light);">Cal: ${recipe.calories}</span>
                </div>
                
                <!-- Micronutrients -->
                <div style="display: flex; gap: 8px; font-size: 11px; color: var(--text-muted); margin-top: 4px; border-top: 1px dashed var(--border); padding-top: 10px;">
                    <span><strong>Iron:</strong> ${recipe.iron.toFixed(1)}mg</span>
                    <span><strong>Magnesium:</strong> ${recipe.magnesium.toFixed(1)}mg</span>
                    <span><strong>Zinc:</strong> ${recipe.zinc.toFixed(1)}mg</span>
                </div>
                
                <!-- Why it works for PCOS -->
                <div style="margin-top: 16px; background-color: var(--bg-secondary); padding: 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--secondary); font-size: 12px;">
                    <strong>PCOS Support:</strong> ${recipe.why_pcos}
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function setFilter(filterType, value) {
    activeFilters[filterType] = value;
    
    // Update button active states in the UI
    let prefix = '';
    if (filterType === 'category') prefix = 'btn-cat-';
    else if (filterType === 'diet') prefix = 'btn-diet-';
    else if (filterType === 'cuisine') prefix = 'btn-cuis-';
    
    const buttons = document.querySelectorAll(`[id^='${prefix}']`);
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    let targetId = prefix + value;
    if (value === 'Mexican Bowls') targetId = prefix + 'MexicanBowls';
    
    const activeBtn = document.getElementById(targetId);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    applyFilters();
}

function applyFilters() {
    const cards = document.querySelectorAll('.meal-card');
    cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const diet = card.getAttribute('data-diet');
        const cuis = card.getAttribute('data-cuisine');
        
        const matchesCat = activeFilters.category === 'all' || cat === activeFilters.category;
        const matchesDiet = activeFilters.diet === 'all' || diet === activeFilters.diet;
        const matchesCuis = activeFilters.cuisine === 'all' || cuis === activeFilters.cuisine;
        
        if (matchesCat && matchesDiet && matchesCuis) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Waist-to-Hip Ratio Calculator
function calculateWHR(event) {
    if (event) event.preventDefault();
    const waist = parseFloat(document.getElementById('whr-waist').value);
    const hip = parseFloat(document.getElementById('whr-hip').value);
    if (!waist || !hip) return;
    
    const ratio = roundFloat(waist / hip, 2);
    
    const resultBox = document.getElementById('whr-result-box');
    const valueSpan = document.getElementById('whr-value');
    const statusP = document.getElementById('whr-status');
    const adviceP = document.getElementById('whr-advice');
    
    valueSpan.innerText = ratio;
    resultBox.style.display = 'block';
    
    if (ratio <= 0.85) {
        resultBox.style.backgroundColor = '#E2EFE9';
        resultBox.style.border = '1px solid #C4DFD2';
        statusP.style.color = '#32644D';
        statusP.innerText = 'Healthy Waist-to-Hip Ratio (Low Risk)';
        adviceP.innerText = 'Your abdominal fat distribution indicates a lower risk of visceral adiposity and insulin resistance. Maintain your healthy balanced nutrition.';
    } else {
        resultBox.style.backgroundColor = '#F8E7E4';
        resultBox.style.border = '1px solid #F1CFC9';
        statusP.style.color = '#8F3A2C';
        statusP.innerText = 'High Waist-to-Hip Ratio (Elevated Risk)';
        adviceP.innerText = 'A ratio above 0.85 for women is linked to insulin resistance and cardiovascular strain. Focus on anti-inflammatory diet parameters, daily movement, and work with our experts to design a plan.';
    }
}

// BMI & BMR Calculator
function calculateBMI(event) {
    if (event) event.preventDefault();
    const weight = parseFloat(document.getElementById('bmi-weight').value);
    const height = parseFloat(document.getElementById('bmi-height').value);
    const age = parseInt(document.getElementById('bmi-age').value);
    if (!weight || !height || !age) return;
    
    const heightM = height / 100;
    const bmi = roundFloat(weight / (heightM * heightM), 1);
    
    const bmr = Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    
    const resultBox = document.getElementById('bmi-result-box');
    document.getElementById('bmi-val').innerText = bmi;
    document.getElementById('bmr-val').innerText = bmr;
    resultBox.style.display = 'block';
    
    let bmiClass = '';
    if (bmi < 18.5) {
        bmiClass = 'Underweight';
        resultBox.style.backgroundColor = '#E5EEF4';
        resultBox.style.border = '1px solid #C8DCE9';
        document.getElementById('bmi-advice').innerText = 'Your weight is below the standard range. Nourishing, caloric-dense foods (nuts, avocados, seeds) can help balance your reproductive hormones.';
    } else if (bmi < 24.9) {
        bmiClass = 'Normal';
        resultBox.style.backgroundColor = '#E2EFE9';
        resultBox.style.border = '1px solid #C4DFD2';
        document.getElementById('bmi-advice').innerText = 'You are in a healthy weight range! Focus on weight maintenance, complex carbs, and regular strength training to build insulin sensitivity.';
    } else {
        bmiClass = bmi < 29.9 ? 'Overweight' : 'Obese';
        resultBox.style.backgroundColor = '#F8E7E4';
        resultBox.style.border = '1px solid #F1CFC9';
        document.getElementById('bmi-advice').innerText = `Your BMI falls under ${bmiClass}. For PCOS, even a minor 5% reduction in body weight can significantly restore menstrual regularity and reduce androgen symptoms. Try targeting a mild caloric deficit.`;
    }
    document.getElementById('bmi-class-val').innerText = bmiClass;
}

function roundFloat(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

// Make functions globally available for inline HTML handlers
window.setFilter = setFilter;
window.calculateWHR = calculateWHR;
window.calculateBMI = calculateBMI;
window.showFlashNotification = showFlashNotification;

function initDashboardView() {
    if (!document.getElementById("lbl-calories")) return;
    const nutri = calculateNutritionalProfile(currentUser);
    const cycle = calculateCyclePhase(currentUser);
    const suggested = getSuggestedRecipe(cycle ? cycle.phase : 'Follicular', currentUser.diet_preference);
    
    document.getElementById("lbl-calories").innerText = nutri ? `${nutri.target_calories}` : '2000';
    document.getElementById("lbl-carbs").innerText = nutri ? `${nutri.carbs_g}` : '200';
    document.getElementById("lbl-protein").innerText = nutri ? `${nutri.protein_g}` : '80';
    document.getElementById("lbl-fat").innerText = nutri ? `${nutri.fat_g}` : '65';
    
    if (nutri) {
        document.getElementById("lbl-iron").innerText = `${nutri.iron_mg} mg`;
        document.getElementById("lbl-magnesium").innerText = `${nutri.magnesium_mg} mg`;
        document.getElementById("lbl-zinc").innerText = `${nutri.zinc_mg} mg`;
        document.getElementById("lbl-bmi-val").innerText = `${nutri.bmi}`;
        document.getElementById("lbl-bmi-class").innerText = `${nutri.bmi_class}`;
        document.getElementById("lbl-weight-val").innerText = `${currentUser.weight} kg`;
        document.getElementById("lbl-height-val").innerText = `${currentUser.height} cm`;
    }
    
    if (cycle) {
        document.getElementById("lbl-phase").innerText = `${cycle.phase}`;
        document.getElementById("lbl-cycle-day").innerText = `${cycle.cycle_day}`;
        document.getElementById("lbl-phase-desc").innerText = `${cycle.phase_description}`;
        document.getElementById("lbl-workout").innerText = `${cycle.recommended_workout}`;
        document.getElementById("lbl-seed").innerText = `${cycle.seed_cycling}`;
        document.getElementById("lbl-next-date").innerText = `${cycle.next_period_date}`;
        document.getElementById("lbl-days-left").innerText = `${cycle.days_until_next}`;
    }
    
    if (suggested) {
        document.getElementById("meal-category").innerText = suggested.category;
        document.getElementById("meal-name").innerText = suggested.name;
        document.getElementById("meal-desc").innerText = suggested.description;
        document.getElementById("meal-why").innerHTML = `<strong>Why it helps PCOS:</strong> ${suggested.why_pcos}`;
        document.getElementById("meal-image").src = suggested.image_url;
        
        const pillsBox = document.getElementById("meal-pills");
        pillsBox.innerHTML = '';
        
        suggested.ingredients.split(',').slice(0,3).forEach(ing => {
            const span = document.createElement("span");
            span.className = "pill-micro";
            span.innerText = ing.trim();
            pillsBox.appendChild(span);
        });
        
        const calSpan = document.createElement("span");
        calSpan.className = "pill-micro";
        calSpan.style.backgroundColor = "var(--secondary-light)";
        calSpan.style.color = "white";
        calSpan.innerText = `${suggested.calories} kcal`;
        pillsBox.appendChild(calSpan);
    } else {
        document.getElementById("meal-suggestion-box").style.display = "none";
    }
    
    const todayStr = new Date().toISOString().split('T')[0];
    const loggedToday = cycleLogs[todayStr];
    if (loggedToday) {
        document.getElementById("log-status").innerHTML = 'Today: Logged <i class="fa-solid fa-circle-check" style="color: var(--primary);"></i>';
        if (loggedToday.flow && loggedToday.flow !== 'none') {
            const flowBtn = document.querySelector(`label[onclick*="'${loggedToday.flow}'"]`);
            if (flowBtn) setFlowLevel(loggedToday.flow, flowBtn);
        }
        document.querySelector("textarea[name='notes']").value = loggedToday.notes || '';
    }
    
    if (nutri) {
        renderMacroChart(nutri.carbs_g, nutri.protein_g, nutri.fat_g);
    }
}

function initOnboardingView() {
    const form = document.getElementById("onboardingForm");
    if (!form) return;
    form.querySelector("input[name='name']").value = currentUser.name || '';
    form.querySelector("input[name='age']").value = currentUser.age || 26;
    form.querySelector("input[name='height']").value = currentUser.height || 162.0;
    form.querySelector("input[name='weight']").value = currentUser.weight || 62.0;
    form.querySelector("select[name='diet_preference']").value = currentUser.diet_preference || 'veg';
    form.querySelector("select[name='lifestyle']").value = currentUser.lifestyle || 'moderate';
    form.querySelector("select[name='exercise_type']").value = currentUser.exercise_type || 'yoga';
    form.querySelector("input[name='exercise_time']").value = currentUser.exercise_time || 30;
    form.querySelector("input[name='cycle_days']").value = currentUser.cycle_days || 28;
    form.querySelector("input[name='period_days']").value = currentUser.period_days || 5;
    form.querySelector("input[name='last_period_date']").value = currentUser.last_period_date || '';
    
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        
        currentUser.name = form.querySelector("input[name='name']").value;
        currentUser.age = parseInt(form.querySelector("input[name='age']").value);
        currentUser.height = parseFloat(form.querySelector("input[name='height']").value);
        currentUser.weight = parseFloat(form.querySelector("input[name='weight']").value);
        currentUser.diet_preference = form.querySelector("select[name='diet_preference']").value;
        currentUser.lifestyle = form.querySelector("select[name='lifestyle']").value;
        currentUser.exercise_type = form.querySelector("select[name='exercise_type']").value;
        currentUser.exercise_time = parseInt(form.querySelector("input[name='exercise_time']").value);
        currentUser.cycle_days = parseInt(form.querySelector("input[name='cycle_days']").value);
        currentUser.period_days = parseInt(form.querySelector("input[name='period_days']").value);
        currentUser.last_period_date = form.querySelector("input[name='last_period_date']").value;
        
        setLocalStorageData('nutrifit_user', currentUser);
        showFlashNotification("Profile successfully synchronized!", "success");
        
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);
    });
}

function initCalendarView() {
    const calendarGrid = document.getElementById("calendar-grid");
    const currentMonthLbl = document.getElementById("calendar-month-label");
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    currentMonthLbl.innerText = `${monthNames[currentMonth]} ${currentYear}`;
    
    calendarGrid.innerHTML = '';
    
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-cell empty";
        calendarGrid.appendChild(emptyCell);
    }
    
    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const cell = document.createElement("div");
        cell.className = "calendar-cell";
        
        const numberSpan = document.createElement("span");
        numberSpan.className = "date-number";
        numberSpan.innerText = day;
        cell.appendChild(numberSpan);
        
        const cellDate = new Date(currentYear, currentMonth, day);
        const todayDate = new Date();
        todayDate.setHours(0,0,0,0);
        cellDate.setHours(0,0,0,0);
        if (cellDate.getTime() === todayDate.getTime()) {
            cell.classList.add("today-highlight");
        }
        
        const dayPhase = getPhaseForDate(cellDate);
        if (dayPhase) {
            cell.classList.add(`phase-${dayPhase.toLowerCase()}`);
            cell.title = `${dayPhase} Phase`;
        }
        
        if (cycleLogs[dateStr]) {
            const dot = document.createElement("div");
            dot.className = "log-indicator-dot";
            cell.appendChild(dot);
            cell.addEventListener("click", () => {
                showLogDetailsModal(dateStr, cycleLogs[dateStr]);
            });
        } else {
            cell.addEventListener("click", () => {
                showQuickLogModal(dateStr);
            });
        }
        
        calendarGrid.appendChild(cell);
    }
}

function initExpertsView() {
    if (!document.getElementById("experts-appointment-list")) return;
    renderAppointments();
    
    const bookModalForm = document.getElementById("bookExpertForm");
    if (bookModalForm) {
        bookModalForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const expertName = document.getElementById("expert-modal-name").value;
            const expertType = document.getElementById("expert-modal-type").value;
            const dateVal = document.getElementById("booking-date").value;
            const timeVal = document.getElementById("booking-time").value;
            
            appointmentsList.push({
                expert_name: expertName,
                expert_type: expertType,
                appointment_date: dateVal,
                appointment_time: timeVal,
                status: 'Scheduled'
            });
            
            setLocalStorageData('nutrifit_appointments', appointmentsList);
            closeBookingModal();
            renderAppointments();
            showFlashNotification(`Consultation scheduled with ${expertName}!`, "success");
        });
    }
}

function renderAppointments() {
    const box = document.getElementById("experts-appointment-list");
    if (!box) return;
    
    box.innerHTML = '';
    if (appointmentsList.length === 0) {
        box.innerHTML = '<div style="color: var(--text-muted); font-size:13px; text-align:center; padding:16px;">No consultations scheduled.</div>';
        return;
    }
    
    appointmentsList.forEach(app => {
        const item = document.createElement("div");
        item.style.cssText = "display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-secondary); padding: 12px 16px; border-radius: var(--radius-sm); border-left: 4px solid var(--primary); margin-bottom: 8px;";
        item.innerHTML = `
            <div>
                <strong style="font-size:14px; color: var(--text-main); display:block;">${app.expert_name}</strong>
                <span style="font-size:12px; color: var(--text-muted);">${app.expert_type} &bull; ${app.appointment_date} @ ${app.appointment_time}</span>
            </div>
            <span class="badge" style="background-color: var(--accent-light); color: var(--primary-dark); font-size:11px; padding:4px 8px; border-radius:8px;">${app.status}</span>
        `;
        box.appendChild(item);
    });
}
