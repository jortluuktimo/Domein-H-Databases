// Europees roulette: 0-36
const RODE_GETALLEN = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

const GETALLEN_VOLGORDE = [
    0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,
    24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26
];

const SEGMENTEN = GETALLEN_VOLGORDE.length; // 37
const HOEK_PER_SEGMENT = (2 * Math.PI) / SEGMENTEN;

let geselecteerdeKeuzes = {}; // { type: waarde }
let bezig = false;
let huidigeHoek = 0;

const canvas = document.getElementById('roulette-wiel');
const ctx = canvas.getContext('2d');
const STRAAL = canvas.width / 2;
const MIDDEN_X = STRAAL;
const MIDDEN_Y = STRAAL;

function getKleur(getal) {
    if (getal === 0) return '#1a6b3a';
    return RODE_GETALLEN.includes(getal) ? '#c0392b' : '#1a1a1a';
}

function tekenWiel(rotatie) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < SEGMENTEN; i++) {
        const startHoek = rotatie + i * HOEK_PER_SEGMENT - Math.PI / 2;
        const eindHoek = startHoek + HOEK_PER_SEGMENT;
        const getal = GETALLEN_VOLGORDE[i];

        // Segment
        ctx.beginPath();
        ctx.moveTo(MIDDEN_X, MIDDEN_Y);
        ctx.arc(MIDDEN_X, MIDDEN_Y, STRAAL - 4, startHoek, eindHoek);
        ctx.closePath();
        ctx.fillStyle = getKleur(getal);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Getal tekst
        ctx.save();
        ctx.translate(MIDDEN_X, MIDDEN_Y);
        ctx.rotate(startHoek + HOEK_PER_SEGMENT / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Lato, sans-serif';
        ctx.fillText(getal, STRAAL - 10, 4);
        ctx.restore();
    }

    // Buitenrand goud
    ctx.beginPath();
    ctx.arc(MIDDEN_X, MIDDEN_Y, STRAAL - 2, 0, 2 * Math.PI);
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function bouwGetallen() {
    const grid = document.getElementById('getallen-grid');
    grid.innerHTML = '';

    // Nul apart
    const nul = document.createElement('button');
    nul.className = 'getal-knop groen';
    nul.textContent = '0';
    nul.onclick = () => selecteerGetal(0, nul);
    grid.appendChild(nul);

    for (let i = 1; i <= 36; i++) {
        const knop = document.createElement('button');
        knop.className = 'getal-knop ' + (RODE_GETALLEN.includes(i) ? 'rood-getal' : 'zwart-getal');
        knop.textContent = i;
        knop.id = 'getal-' + i;
        knop.onclick = () => selecteerGetal(i, knop);
        grid.appendChild(knop);
    }
}

function selecteerGetal(getal, knop) {
    if (bezig) return;

    // Deselect andere getal knoppen
    document.querySelectorAll('.getal-knop').forEach(k => k.classList.remove('actief'));

    if (geselecteerdeKeuzes['getal'] === getal) {
        delete geselecteerdeKeuzes['getal'];
    } else {
        geselecteerdeKeuzes['getal'] = getal;
        knop.classList.add('actief');
    }
}

function selecteerKeuze(type, waarde, knop) {
    if (bezig) return;

    // Deselect andere knoppen van hetzelfde type
    if (type === 'kleur') {
        document.getElementById('keuze-rood').classList.remove('actief');
        document.getElementById('keuze-zwart').classList.remove('actief');
    } else if (type === 'pariteit') {
        document.getElementById('keuze-even').classList.remove('actief');
        document.getElementById('keuze-oneven').classList.remove('actief');
    }

    if (geselecteerdeKeuzes[type] === waarde) {
        delete geselecteerdeKeuzes[type];
    } else {
        geselecteerdeKeuzes[type] = waarde;
        knop.classList.add('actief');
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

async function draaiRoulette() {
    if (bezig) return;

    const inzet = parseFloat(document.getElementById('inzet-input').value);
    const aantalKeuzes = Object.keys(geselecteerdeKeuzes).length;

    if (isNaN(inzet) || inzet <= 0) {
        toonResultaat('Voer een geldige inzet in.', 'verlies');
        return;
    }
    if (aantalKeuzes === 0) {
        toonResultaat('Kies eerst een inzetoptie!', 'verlies');
        return;
    }

    const totaleInzet = inzet * aantalKeuzes;
    if (totaleInzet > window.huidigSaldo) {
        toonResultaat('Niet genoeg saldo!', 'verlies');
        return;
    }

    bezig = true;
    document.getElementById('speel-knop').disabled = true;
    document.getElementById('knop-tekst').textContent = '...';
    document.getElementById('resultaat-balk').textContent = '';

    // Trek inzet af
    const inzetRes = await fetch('roulette.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'actie=inzet&inzet=' + totaleInzet
    });
    const inzetData = await inzetRes.json();
    if (!inzetData.success) {
        toonResultaat(inzetData.bericht || 'Fout', 'verlies');
        bezig = false;
        document.getElementById('speel-knop').disabled = false;
        document.getElementById('knop-tekst').textContent = 'DRAAIEN';
        return;
    }
    updateSaldoDisplay(window.huidigSaldo - totaleInzet);

    // Bepaal willekeurig uitkomst getal
    const uitkomstGetal = Math.floor(Math.random() * 37); // 0-36
    const uitkomstIndex = GETALLEN_VOLGORDE.indexOf(uitkomstGetal);

    // Animeer wiel
    await animeerWiel(uitkomstIndex);

    // Bereken winst
    let winst = 0;

    if ('getal' in geselecteerdeKeuzes) {
        if (geselecteerdeKeuzes['getal'] === uitkomstGetal) {
            winst += inzet * 36;
        }
    }
    if ('kleur' in geselecteerdeKeuzes && uitkomstGetal !== 0) {
        const isRood = RODE_GETALLEN.includes(uitkomstGetal);
        if ((geselecteerdeKeuzes['kleur'] === 'rood' && isRood) ||
            (geselecteerdeKeuzes['kleur'] === 'zwart' && !isRood)) {
            winst += inzet * 2;
        }
    }
    if ('pariteit' in geselecteerdeKeuzes && uitkomstGetal !== 0) {
        const isEven = uitkomstGetal % 2 === 0;
        if ((geselecteerdeKeuzes['pariteit'] === 'even' && isEven) ||
            (geselecteerdeKeuzes['pariteit'] === 'oneven' && !isEven)) {
            winst += inzet * 2;
        }
    }

    // Stuur winst naar PHP
    const winstRes = await fetch('roulette.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'actie=winst&winst=' + winst
    });
    const winstData = await winstRes.json();
    updateSaldoDisplay(winstData.saldo);

    const kleurNaam = uitkomstGetal === 0 ? 'groen' : (RODE_GETALLEN.includes(uitkomstGetal) ? 'rood' : 'zwart');

    if (winst > 0) {
        toonResultaat(`🎉 ${uitkomstGetal} (${kleurNaam}) — Gewonnen! +€${winst.toLocaleString('nl-NL', {minimumFractionDigits:2})}`, 'win');
        document.querySelector('.wiel-container').classList.add('gewonnen');
        setTimeout(() => document.querySelector('.wiel-container').classList.remove('gewonnen'), 2000);
    } else {
        toonResultaat(`${uitkomstGetal} (${kleurNaam}) — Helaas, geen prijs!`, 'verlies');
    }

    bezig = false;
    document.getElementById('speel-knop').disabled = false;
    document.getElementById('knop-tekst').textContent = 'DRAAIEN';
}

function animeerWiel(uitkomstIndex) {
    return new Promise(resolve => {
        // Hoek zodat het juiste segment onder de naald (boven, -PI/2) eindigt
        const doelHoek = -(uitkomstIndex * HOEK_PER_SEGMENT);
        const extraRondjes = (5 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
        
        // Bereken hoeveel we moeten draaien vanaf huidige positie
        let verschil = doelHoek - (huidigeHoek % (2 * Math.PI));
        if (verschil > 0) verschil -= 2 * Math.PI;
        
        const totaalDraaien = extraRondjes + Math.abs(verschil);

        const duur = 4000;
        const startTijd = performance.now();
        const startHoek = huidigeHoek;

        function easeOut(t) {
            return 1 - Math.pow(1 - t, 4);
        }

        function frame(nu) {
            const verstreken = nu - startTijd;
            const voortgang = Math.min(verstreken / duur, 1);
            const gemakkelijk = easeOut(voortgang);

            huidigeHoek = startHoek - totaalDraaien * gemakkelijk;
            tekenWiel(huidigeHoek);

            if (voortgang < 1) {
                requestAnimationFrame(frame);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(frame);
    });
}

// Init
bouwGetallen();
tekenWiel(0);