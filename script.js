// Supabase Project configuration
const SUPABASE_URL = 'https://vdayhyskbqftbosyuuxw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PdTooE8JASI-XmWZ7FQ1JQ_l4M077U4';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const teams = ['Team A', 'Team B', 'Team C', 'Team D'];

document.addEventListener('DOMContentLoaded', () => {
    // Check if user already registered on this device locally
    if (localStorage.getItem('mathsoc_team')) {
        showResult(localStorage.getItem('mathsoc_name'), localStorage.getItem('mathsoc_team'));
        document.getElementById('registration-form').classList.add('hidden');
    }

    document.getElementById('registration-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let name = document.getElementById('name').value.trim();
        const entryNumber = document.getElementById('entry-number').value.trim().toUpperCase();
        const errorEl = document.getElementById('error-message');
        const submitBtn = document.getElementById('submit-btn');
        
        errorEl.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            console.log("Checking DB for existing entry...");
            // Check if Entry Number already exists
            const { data: existing, error: fetchError } = await supabaseClient
                .from('registrations')
                .select('team, name')
                .eq('entry_number', entryNumber)
                .limit(1);

            let assignedTeam, teamLetter, isNew = true;

            if (existing && existing.length > 0) {
                // Already registered
                assignedTeam = existing[0].team;
                name = existing[0].name; // Use their originally registered name
                teamLetter = assignedTeam.replace('Team ', '');
                isNew = false;
                console.log("User already exists, playing animation to reveal their existing team");
            } else {
                // Determine new team beforehand
                assignedTeam = teams[Math.floor(Math.random() * teams.length)];
                teamLetter = assignedTeam.replace('Team ', '');
                console.log("New user, randomly assigned team:", assignedTeam);
            }

            // Start Animation
            document.getElementById('registration-form').classList.add('hidden');
            const animationContainer = document.getElementById('animation-container');
            animationContainer.classList.remove('hidden');
            
            const slotStrip = document.getElementById('slot-strip');
            slotStrip.innerHTML = ''; // clear strip
            
            // Build the slot machine strip (30 items)
            // We want it to stop at index 25
            const stopIndex = 25;
            const itemHeight = 100; // pixels
            const letters = ['A', 'B', 'C', 'D'];
            
            for (let i = 0; i < 30; i++) {
                const el = document.createElement('div');
                el.className = 'slot-item';
                if (i === stopIndex) {
                    el.textContent = teamLetter;
                    el.classList.add('winner');
                } else {
                    el.textContent = letters[Math.floor(Math.random() * letters.length)];
                }
                slotStrip.appendChild(el);
            }
            
            // Reset position instantly
            slotStrip.style.transition = 'none';
            slotStrip.style.transform = 'translateY(0px)';
            
            // Force browser reflow to apply the reset instantly before animating
            void slotStrip.offsetWidth;
            
            // Start spinning
            // We use a cubic-bezier easing that starts fast and slows down to a dramatic stop
            slotStrip.style.transition = 'transform 3.5s cubic-bezier(0.1, 0.9, 0.2, 1)';
            slotStrip.style.transform = `translateY(-${itemHeight * stopIndex}px)`;

            // Wait for the animation to finish (it takes 3.5 seconds)
            await new Promise(resolve => setTimeout(resolve, 3800)); 

            if (isNew) {
                console.log("Inserting new user into DB...");
                // Save to Supabase (ip_address is omitted to remove the IP restriction entirely)
                const { error: insertError } = await supabaseClient
                    .from('registrations')
                    .insert([
                        { name: name, entry_number: entryNumber, team: assignedTeam }
                    ]);
                    
                if (insertError) {
                    console.error(insertError);
                    if (insertError.code === '23505') {
                        throw new Error('This Entry Number has already been registered.');
                    }
                    throw new Error('Failed to save registration. Please try again.');
                }
            }

            // Save locally
            localStorage.setItem('mathsoc_team', assignedTeam);
            localStorage.setItem('mathsoc_name', name);

            // Hide animation, show result
            animationContainer.classList.add('hidden');
            showResult(name, assignedTeam);

        } catch (error) {
            console.error("Error during submission:", error);
            document.getElementById('registration-form').classList.remove('hidden');
            document.getElementById('animation-container').classList.add('hidden');
            errorEl.textContent = error.message;
            errorEl.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Get My Team!';
        }
    });
});

function showResult(name, team) {
    document.getElementById('result-container').classList.remove('hidden');
    document.getElementById('result-name').textContent = name;
    document.getElementById('assigned-team').textContent = team;
}
