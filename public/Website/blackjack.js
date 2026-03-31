// ========================
// DECK
// ========================
const SUITS = ['♠', '♥', '♦', '♣'];
const WAARDEN = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const AANTAL_DECKS = 6;

let deck = [];
let dealerHand = [];
let spelerHanden = [[]];
let actieveHand = 0;
let inzetten = [0];
let bezig = false;

function maakDeck() {
    deck = [];
    for (let d = 0; d < AANTAL_DECKS; d++) {
        for (const suit of SUITS) {
            for (const waarde of WAARDEN) {
                deck.push({ suit, waarde });
            }
        }
    }
    schudDeck();
}

function schudDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function trekKaart() {
    if (deck.length < 52) maakDeck();
    return deck.pop();
}

// ========================
// KAART WAARDE
// ========================
function kaartWaarde(kaart) {
    if (['J', 'Q', 'K'].includes(kaart.waarde)) return 10;
    if (kaart.waarde === 'A') return 11;
    return parseInt(kaart.waarde);
}

function handWaarde(hand) {
    let totaal = 0;
    let azen = 0;
    for (const k of hand) {
        totaal += kaartWaarde(k);
        if (k.waarde === 'A') azen++;
    }
    while (totaal > 21 && azen > 0) {
        totaal -= 10;
        azen--;
    }
    return totaal;
}

function isBlackjack(hand) {
    return hand.length === 2 && handWaarde(hand) === 21;
}

// ========================
// UI
// ========================
function kaartHTML(kaart, verborgen = false) {
    if (verborgen) {
        return `<div class="speelkaart verborgen"><span class="kaart-rug">🂠</span></div>`;
    }
    const rood = ['♥', '♦'].includes(kaart.suit);
    return `<div class="speelkaart ${rood ? 'rood' : 'zwart'}">
        <span class="kaart-hoek links">${kaart.waarde}<br>${kaart.suit}</span>
        <span class="kaart-midden">${kaart.suit}</span>
        <span class="kaart-hoek rechts">${kaart.waarde}<br>${kaart.suit}</span>
    </div>`;
}

function renderDealerKaarten(toonAlles = false) {
    const container = document.getElementById('dealer-kaarten');
    container.innerHTML = dealerHand.map((k, i) =>
        kaartHTML(k, !toonAlles && i === 1)
    ).join('');

    const score = document.getElementById('dealer-score');
    if (toonAlles) {
        score.textContent = handWaarde(dealerHand);
    } else {
        score.textContent = kaartWaarde(dealerHand[0]);
    }
}

function renderSpelerKaarten() {
    for (let h = 0; h < spelerHanden.length; h++) {
        const container = document.getElementById('speler-kaarten-' + h);
        if (!container) continue;

        // Hand 1 alleen tonen als er gesplitst is
        if (h === 1 && spelerHanden.length < 2) continue;

        container.innerHTML = spelerHanden[h].map(k => kaartHTML(k)).join('');
        const score = document.getElementById('speler-score-' + h);
        if (score) score.textContent = handWaarde(spelerHanden[h]);

        const handBlok = document.getElementById('hand-' + h);
        if (handBlok) {
            handBlok.classList.toggle('actief-hand', h === actieveHand);
        }
    }
}

function toonResultaat(tekst, type) {
    const balk = document.getElementById('resultaat-balk');
    balk.textContent = tekst;
    balk.className = 'resultaat-balk ' + (type === 'win' ? 'resultaat-win' : type === 'verlies' ? 'resultaat-verlies' : 'resultaat-gelijk');
}

function setInzet(bedrag) {
    document.getElementById('inzet-input').value = bedrag;
}

function updateSaldoDisplay(saldo) {
    const formatted = parseFloat(saldo).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('saldo-display').textContent = formatted;
    window.huidigSaldo = parseFloat(saldo);
}

function toonControls(modus) {
    document.getElementById('inzet-sectie').classList.toggle('verborgen', modus !== 'inzet');
    document.getElementById('actie-knoppen').classList.toggle('verborgen', modus !== 'spelen');
}

function setBezigState(staat) {
    bezig = staat;
    const knoppen = ['knop-hit', 'knop-stand', 'knop-double', 'knop-split'];
    knoppen.forEach(id => {
        const knop = document.getElementById(id);
        if (knop) knop.disabled = staat;
    });
}

function updateSplitKnop() {
    const hand = spelerHanden[actieveHand];
    const kanSplitsen = hand.length === 2 &&
        kaartWaarde(hand[0]) === kaartWaarde(hand[1]) &&
        spelerHanden.length < 2 &&
        window.huidigSaldo >= inzetten[actieveHand];
    document.getElementById('knop-split').disabled = !kanSplitsen;

    const kanDubbelen = hand.length === 2 &&
        window.huidigSaldo >= inzetten[actieveHand];
    document.getElementById('knop-double').disabled = !kanDubbelen;
}

// ========================
// SALDO API
// ========================
async function betaalInzet(bedrag) {
    const res = await fetch('blackjack.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'actie=inzet&inzet=' + bedrag
    });
    return await res.json();
}

async function betaalWinst(bedrag) {
    const res = await fetch('blackjack.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'actie=winst&winst=' + bedrag
    });
    return await res.json();
}

// ========================
// SPELLOGICA
// ========================
async function dealKaarten() {
    if (bezig) return;

    const inzet = parseFloat(document.getElementById('inzet-input').value);
    if (isNaN(inzet) || inzet <= 0) { toonResultaat('Voer een geldige inzet in.', 'verlies'); return; }
    if (inzet > window.huidigSaldo) { toonResultaat('Niet genoeg saldo!', 'verlies'); return; }
    document.getElementById('hand-1').style.display = 'none';

    setBezigState(true);

    // Reset
    dealerHand = [];
    spelerHanden = [[]];
    actieveHand = 0;
    inzetten = [inzet];
    document.getElementById('speler-kaarten-0').innerHTML = '';
    document.getElementById('speler-kaarten-1').innerHTML = '';
    document.getElementById('speler-score-0').textContent = '';
    document.getElementById('speler-score-1').textContent = '';
    document.getElementById('hand-1').style.display = 'none';   // verbergen
    document.getElementById('speler-kaarten-1').innerHTML = '';
    document.getElementById('speler-score-1').textContent = '';
    document.getElementById('resultaat-balk').className = 'resultaat-balk';
    document.getElementById('resultaat-balk').textContent = '';

    const inzetData = await betaalInzet(inzet);
    if (!inzetData.success) {
        toonResultaat(inzetData.bericht, 'verlies');
        setBezigState(false);
        return;
    }
    updateSaldoDisplay(window.huidigSaldo - inzet);

    spelerHanden[0].push(trekKaart());
    dealerHand.push(trekKaart());
    spelerHanden[0].push(trekKaart());
    dealerHand.push(trekKaart());

    renderDealerKaarten(false);
    renderSpelerKaarten();

    if (isBlackjack(spelerHanden[0])) {
        await eindSpel();
        return;
    }

    toonControls('spelen');
    setBezigState(false);
    updateSplitKnop();
}

async function hit() {
    if (bezig) return;
    setBezigState(true);

    spelerHanden[actieveHand].push(trekKaart());
    renderSpelerKaarten();

    if (handWaarde(spelerHanden[actieveHand]) >= 21) {
        await volgendeHandOfEind();
        return;
    }

    setBezigState(false);
    // Na hit: double en split niet meer mogelijk
    document.getElementById('knop-double').disabled = true;
    document.getElementById('knop-split').disabled = true;
}

async function stand() {
    if (bezig) return;
    setBezigState(true);
    await volgendeHandOfEind();
}

async function dubbelen() {
    if (bezig) return;
    setBezigState(true);

    const extra = inzetten[actieveHand];
    if (extra > window.huidigSaldo) {
        toonResultaat('Niet genoeg saldo!', 'verlies');
        setBezigState(false);
        return;
    }
    const data = await betaalInzet(extra);
    if (!data.success) {
        toonResultaat(data.bericht, 'verlies');
        setBezigState(false);
        return;
    }
    updateSaldoDisplay(window.huidigSaldo - extra);
    inzetten[actieveHand] *= 2;

    spelerHanden[actieveHand].push(trekKaart());
    renderSpelerKaarten();
    await volgendeHandOfEind();
}

async function splitsen() {
    if (bezig) return;
    document.getElementById('hand-1').style.display = 'block';
    setBezigState(true);

    const hand = spelerHanden[actieveHand];
    const extra = inzetten[actieveHand];
    if (extra > window.huidigSaldo) {
        toonResultaat('Niet genoeg saldo!', 'verlies');
        setBezigState(false);
        return;
    }
    const data = await betaalInzet(extra);
    if (!data.success) {
        setBezigState(false);
        return;
    }
    updateSaldoDisplay(window.huidigSaldo - extra);

    spelerHanden = [[hand[0]], [hand[1]]];
    inzetten = [inzetten[0], extra];
    actieveHand = 0;

    spelerHanden[0].push(trekKaart());
    spelerHanden[1].push(trekKaart());

    document.getElementById('hand-1').style.display = 'none';   // verbergen
    document.getElementById('hand-1').style.display = 'block';  // tonen (bij splitsen)
    renderSpelerKaarten();

    setBezigState(false);
    updateSplitKnop();
}

async function volgendeHandOfEind() {
    if (actieveHand < spelerHanden.length - 1) {
        actieveHand++;
        renderSpelerKaarten();
        setBezigState(false);
        updateSplitKnop();
        document.getElementById('knop-double').disabled = spelerHanden[actieveHand].length !== 2 || window.huidigSaldo < inzetten[actieveHand];
    } else {
        await eindSpel();
    }
}

async function eindSpel() {
    renderDealerKaarten(true);

    const alleBust = spelerHanden.every(h => handWaarde(h) > 21);
    if (!alleBust) {
        while (handWaarde(dealerHand) < 17) {
            await wacht(400);
            dealerHand.push(trekKaart());
            renderDealerKaarten(true);
        }
    }

    const dealerScore = handWaarde(dealerHand);
    const dealerBJ = isBlackjack(dealerHand) && dealerHand.length === 2;

    let totaleWinst = 0;
    let berichten = [];

    for (let h = 0; h < spelerHanden.length; h++) {
        const spelerScore = handWaarde(spelerHanden[h]);
        const spelerBJ = isBlackjack(spelerHanden[h]) && spelerHanden.length === 1;
        const inzet = inzetten[h];
        const label = spelerHanden.length > 1 ? `Hand ${h + 1}: ` : '';

        if (spelerScore > 21) {
            berichten.push(`${label}Bust! Verloren.`);
        } else if (dealerBJ && !spelerBJ) {
            berichten.push(`${label}Dealer Blackjack! Verloren.`);
        } else if (spelerBJ && !dealerBJ) {
            const winst = inzet * 2.5;
            totaleWinst += winst;
            berichten.push(`${label}BLACKJACK! +€${winst.toFixed(2)}`);
        } else if (spelerScore > dealerScore || dealerScore > 21) {
            const winst = inzet * 2;
            totaleWinst += winst;
            berichten.push(`${label}Gewonnen! +€${winst.toFixed(2)}`);
        } else if (spelerScore === dealerScore) {
            totaleWinst += inzet;
            berichten.push(`${label}Gelijkspel. Inzet terug.`);
        } else {
            berichten.push(`${label}Verloren.`);
        }
    }

    if (totaleWinst > 0) {
        const winstData = await betaalWinst(totaleWinst);
        updateSaldoDisplay(winstData.saldo);
    }

    const heeftGewonnen = totaleWinst > 0 && totaleWinst > inzetten.reduce((a, b) => a + b, 0);
    const isGelijk = totaleWinst > 0 && totaleWinst === inzetten.reduce((a, b) => a + b, 0);
    toonResultaat(berichten.join(' | '), heeftGewonnen ? 'win' : isGelijk ? 'gelijk' : 'verlies');

    toonControls('inzet');
    // bezig blijft true zodat actieknoppen geblokkeerd zijn — ze zijn toch verborgen
    bezig = false;
}

function wacht(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Init
maakDeck();
toonControls('inzet');