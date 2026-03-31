const SYMBOLEN = ['🍒', '🍋', '🍊', '⭐', '💎', '🎰'];

const UITBETALINGEN = {
    '🍒🍒🍒': 2,
    '🍋🍋🍋': 3,
    '🍊🍊🍊': 4,
    '⭐⭐⭐':  6,
    '💎💎💎': 10,
    '🎰🎰🎰': 20,
};

let bezig = false;

// Vul elke rol met symbolen
function initRollen() {
    for (let i = 0; i < 3; i++) {
        const strip = document.getElementById('strip-' + i);
        strip.innerHTML = '';
        // Maak een lange strip van symbolen
        for (let j = 0; j < 30; j++) {
            const div = document.createElement('div');
            div.className = 'symbool';
            div.textContent = SYMBOLEN[Math.floor(Math.random() * SYMBOLEN.length)];
            strip.appendChild(div);
        }
    }
}

function setInzet(bedrag) {
    document.getElementById('inzet-input').value = bedrag;
}

function updateSaldoDisplay(saldo) {
    const formatted = parseFloat(saldo).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('saldo-display').textContent = formatted;
    window.huidigSaldo = parseFloat(saldo);
}

function toonResultaat(tekst, type) {
    const balk = document.getElementById('resultaat-balk');
    balk.textContent = tekst;
    balk.className = 'resultaat-balk ' + (type === 'win' ? 'resultaat-win' : 'resultaat-verlies');
}

async function draaiSlots() {
    if (bezig) return;

    const inzet = parseFloat(document.getElementById('inzet-input').value);

    if (isNaN(inzet) || inzet <= 0) {
        toonResultaat('Voer een geldige inzet in.', 'verlies');
        return;
    }

    if (inzet > window.huidigSaldo) {
        toonResultaat('Niet genoeg saldo!', 'verlies');
        return;
    }

    bezig = true;
    document.getElementById('speel-knop').disabled = true;
    document.getElementById('knop-tekst').textContent = '...';
    document.getElementById('resultaat-balk').textContent = '';
    document.getElementById('machine').classList.remove('gewonnen');

    // Trek inzet af via PHP
    const inzetResponse = await fetch('slots.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'actie=inzet&inzet=' + inzet
    });
    const inzetData = await inzetResponse.json();

    if (!inzetData.success) {
        toonResultaat(inzetData.bericht || 'Fout', 'verlies');
        bezig = false;
        document.getElementById('speel-knop').disabled = false;
        document.getElementById('knop-tekst').textContent = 'DRAAIEN';
        return;
    }

    // Update saldo direct na inzet
    updateSaldoDisplay(window.huidigSaldo - inzet);

    // Bepaal eindresultaat
    const eindResultaat = [
        SYMBOLEN[Math.floor(Math.random() * SYMBOLEN.length)],
        SYMBOLEN[Math.floor(Math.random() * SYMBOLEN.length)],
        SYMBOLEN[Math.floor(Math.random() * SYMBOLEN.length)],
    ];

    // Animeer de rollen
    const animaties = eindResultaat.map((symbool, i) => animeerRol(i, symbool));
    await Promise.all(animaties);

    // Bereken winst
    const combo = eindResultaat.join('');
    let multiplier = 0;

    if (UITBETALINGEN[combo]) {
        multiplier = UITBETALINGEN[combo];
    } else {
        // Check 2 dezelfde
        const counts = {};
        eindResultaat.forEach(s => counts[s] = (counts[s] || 0) + 1);
        if (Object.values(counts).some(c => c >= 2)) {
            multiplier = 1.2;
        }
    }

    const winst = multiplier > 0 ? parseFloat((inzet * multiplier).toFixed(2)) : 0;

    // Stuur winst naar PHP en haal nieuw saldo op
    const winstResponse = await fetch('slots.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'actie=winst&winst=' + winst
    });
    const winstData = await winstResponse.json();
    updateSaldoDisplay(winstData.saldo);

    if (winst > 0) {
        toonResultaat('🎉 Gewonnen! +€' + winst.toLocaleString('nl-NL', { minimumFractionDigits: 2 }), 'win');
        document.querySelector('#machine').classList.add('gewonnen');
        setTimeout(() => document.querySelector('#machine').classList.remove('gewonnen'), 2000);
    } else {
        toonResultaat('Helaas, geen prijs!', 'verlies');
    }

    bezig = false;
    document.getElementById('speel-knop').disabled = false;
    document.getElementById('knop-tekst').textContent = 'DRAAIEN';
}

function animeerRol(rolIndex, eindSymbool) {
    return new Promise(resolve => {
        const strip = document.getElementById('strip-' + rolIndex);
        const vertraging = rolIndex * 300; // elke rol stopt iets later

        // Zet het eindsymbool als laatste item in de strip
        const symbolen = [];
        const aantalExtra = 20 + rolIndex * 5;
        for (let i = 0; i < aantalExtra; i++) {
            symbolen.push(SYMBOLEN[Math.floor(Math.random() * SYMBOLEN.length)]);
        }
        symbolen.push(eindSymbool);

        strip.innerHTML = '';
        symbolen.forEach(s => {
            const div = document.createElement('div');
            div.className = 'symbool';
            div.textContent = s;
            strip.appendChild(div);
        });

        // Start positie bovenaan
        strip.style.transition = 'none';
        strip.style.top = '0px';

        const totaalHoogte = symbolen.length * 120;
        const eindPositie = -(totaalHoogte - 120); // laatste symbool in beeld

        setTimeout(() => {
            strip.style.transition = `top ${0.8 + rolIndex * 0.3}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
            strip.style.top = eindPositie + 'px';

            setTimeout(() => {
                resolve();
            }, (0.8 + rolIndex * 0.3) * 1000 + vertraging);
        }, vertraging + 50);
    });
}

// Init bij laden
initRollen();