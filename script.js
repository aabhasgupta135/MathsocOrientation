// Supabase Project configuration
const SUPABASE_URL = 'https://vdayhyskbqftbosyuuxw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PdTooE8JASI-XmWZ7FQ1JQ_l4M077U4';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const teams = ['Team A', 'Team B', 'Team C', 'Team D'];

document.addEventListener('DOMContentLoaded', () => {
    // Check if user already registered on this device
    if (localStorage.getItem('mathsoc_team')) {
        showResult(localStorage.getItem('mathsoc_name'), localStorage.getItem('mathsoc_team'));
        document.getElementById('registration-form').classList.add('hidden');
    }

    document.getElementById('registration-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const entryNumber = document.getElementById('entry-number').value.trim().toUpperCase();
        const errorEl = document.getElementById('error-message');
        const submitBtn = document.getElementById('submit-btn');
        
        errorEl.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            // Get User IP to prevent multiple registrations from same IP
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const ipAddress = ipData.ip;

            // Check if IP or Entry Number exists
            const { data: existing, error: fetchError } = await supabase
                .from('registrations')
                .select('team, name')
                .or(`ip_address.eq.${ipAddress},entry_number.eq.${entryNumber}`)
                .limit(1);

            if (existing && existing.length > 0) {
                // Already registered
                localStorage.setItem('mathsoc_team', existing[0].team);
                localStorage.setItem('mathsoc_name', existing[0].name);
                showResult(existing[0].name, existing[0].team);
                document.getElementById('registration-form').classList.add('hidden');
                return;
            }

            // Start animation
            document.getElementById('registration-form').classList.add('hidden');
            const animationContainer = document.getElementById('animation-container');
            animationContainer.classList.remove('hidden');
            
            const spinningText = document.getElementById('spinning-text');
            
            // Rapidly change text to simulate randomization
            let interval = setInterval(() => {
                const randomTempTeam = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
                spinningText.textContent = randomTempTeam;
            }, 100);

            // Wait for 2.5 seconds for dramatic effect
            await new Promise(resolve => setTimeout(resolve, 2500));
            clearInterval(interval);
            
            // Assign actual team
            const assignedTeam = teams[Math.floor(Math.random() * teams.length)];
            spinningText.textContent = assignedTeam.replace('Team ', '');
            
            // Save to Supabase
            const { error: insertError } = await supabase
                .from('registrations')
                .insert([
                    { name: name, entry_number: entryNumber, team: assignedTeam, ip_address: ipAddress }
                ]);
                
            if (insertError) {
                console.error(insertError);
                if (insertError.code === '23505') {
                    throw new Error('This IP or Entry Number has already been registered.');
                }
                throw new Error('Failed to save registration. Please ensure your Supabase URL is correct.');
            }

            // Save locally
            localStorage.setItem('mathsoc_team', assignedTeam);
            localStorage.setItem('mathsoc_name', name);

            // Show result
            animationContainer.classList.add('hidden');
            showResult(name, assignedTeam);

        } catch (error) {
            console.error(error);
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
