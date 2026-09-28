// Frågorna som visas i quizet. Rätta svar ligger INTE här utan i private/answer-key.js
// (och i Supabase-tabellen question_keys). Typer: mc = flerval, tf = sant/falskt, estimate = skattning.

window.QUIZ = {
  "title": "Från konsumentkreditinstitut till bank",
  "subtitle": "Hur bra koll har du på kapital och likviditet?",
  "questions": [
    {
      "id": "q1",
      "type": "mc",
      "text": "Vad är den viktigaste skillnaden mellan kapital och likviditet?",
      "options": [
        "Det är två ord för samma sak",
        "Kapital är pengarna på kontot, likviditet är vinsten",
        "Kapital tar förluster, likviditet gör att vi kan betala i tid",
        "Likviditet gäller bara de stora bankerna"
      ]
    },
    {
      "id": "q2",
      "type": "mc",
      "text": "Vilken riskvikt får ett vanligt blancolån till en privatperson?",
      "options": [
        "20 %",
        "75 %",
        "100 %",
        "150 %"
      ]
    },
    {
      "id": "q3",
      "type": "mc",
      "text": "Vilket av följande sänker vår kapitalrelation?",
      "options": [
        "Vi går med vinst och behåller den",
        "Kunderna betalar i tid",
        "Vi köper svenska statspapper",
        "Vi växer snabbt utan att ta in nytt kapital"
      ]
    },
    {
      "id": "q4",
      "type": "estimate",
      "text": "Vi lånar ut 100 Mkr mer i blancolån. Riskvikten är 75 % och kravet 16,5 %. Ungefär hur mycket mer eget kapital behövs?",
      "unit": "Mkr"
    },
    {
      "id": "q5",
      "type": "tf",
      "text": "Om vi hamnar under buffertkraven får vi begränsningar, till exempel för utdelning till ägarna."
    },
    {
      "id": "q6",
      "type": "mc",
      "text": "Vad mäter LCR?",
      "options": [
        "Om de likvida tillgångarna räcker till 30 dagars stressade utflöden",
        "Eget kapital i förhållande till det riskvägda beloppet",
        "Hur stor andel av kunderna som betalar i tid",
        "Räntan på vår inlåning"
      ]
    },
    {
      "id": "q7",
      "type": "mc",
      "text": "Vilken av de här tillgångarna räknas fullt ut i likviditetsreserven?",
      "options": [
        "Pengar på konto i en annan bank",
        "Våra blancolån",
        "Aktiverad IT-utveckling",
        "Svenska statsskuldväxlar"
      ]
    },
    {
      "id": "q8",
      "type": "estimate",
      "text": "Vi har 2 000 Mkr i inlåning och räknar med att 10 % tas ut under en stressad månad. Andra utflöden är 30 Mkr och kunderna betalar in 50 Mkr. Hur mycket likvida tillgångar behöver vi minst för LCR 100 %?",
      "unit": "Mkr"
    }
  ]
};
