import { state, inputs, unitElements, results_desc_text, actionButtons } from "./ui.js"


export function changeHasResult(newValue, d = null) {

    state.has_result = newValue;
    if (state.has_result) {
        actionButtons.copy.removeAttribute("disabled");
    } else {
        actionButtons.copy.setAttribute("disabled", "disabled");
    }

    if (state.has_result) {
        if (state.lastResult != newValue) {
            if (state.lastResultsList.find((el) => el == d) == undefined) {
                state.resultsCalculated++;
                console.log(Date.now() - state.lastTimeStarsViewed)
                if ((state.resultsCalculated % 5 == 0 || state.resultsCalculated == 1) && Date.now() - state.lastTimeStarsViewed > 1000 * 60) {
                    setTimeout(() => {
                        if (state.stars_clicked === "false") {
                            location.href = "./thx_page.html";
                            state.lastTimeStarsViewed = Date.now();
                            localStorage.setItem("lastTimeStarsViewed", state.lastTimeStarsViewed.toString());
                        }
                    }, 5000)
                }
                console.log(state.resultsCalculated)
                localStorage.setItem('calcResult', state.resultsCalculated);
                state.lastResultsList.push(d);
                if (state.lastResultsList.length > 50) {
                    state.lastResultsList.pop(0);
                }
            }
        }
        state.lastResult = newValue;
    }

}

function collectFormData() {
    return {
        sex: state.sex,
        black_race: state.race,
        weight: parseFloat(inputs.weight.value) * (unitElements.weight.getAttribute("value") === "kg" ? 1 : 0.45359237),
        height: parseFloat(inputs.height.value) * (unitElements.height.getAttribute("value") === "cm" ? 1 : 2.54),
        creatinine: parseFloat(inputs.creatinine.value) * (unitElements.creatinine.getAttribute("value") === "mg/dL" ? 1 : 1 / 88.4),
        cystatin: parseFloat(inputs.cystatin.value),
        age: parseFloat(inputs.age.value)
    };
}


function calculateGault(formdata) {

    let sexMultiplier = formdata.sex === "female" ? 0.85 : 1;
    let heightInches = formdata.height / 2.54;
    let ibw = formdata['sex'] === "male" ? 50 + (2.3 * (heightInches - 60)) : 45.5 + (2.3 * (heightInches - 60));
    let abw = ibw + 0.4 * (formdata['weight'] - ibw);
    let bmi = formdata['weight'] / (Math.pow(formdata['height'] / 100, 2));
    let weightUsed = (bmi >= 18.5 && bmi <= 24.9) ? ibw : formdata.weight;

    let crCl = (140 - formdata['age']) * weightUsed * sexMultiplier / (72 * formdata['creatinine']);
    results_desc_text.innerHTML = `<div class="point"><h2>${Math.round(crCl)}<small class="ss">mL/min</small></h2><div style="font-size: 12px;">Creatinine clearance, adjusted Cockcroft-Gault</div></div>`;
    let bmi_case = "";

    if (bmi >= 25) {
        let crCl2 = (140 - formdata['age']) * abw * sexMultiplier / (72 * formdata['creatinine']);
        results_desc_text.innerHTML += "<div class='seppep'></div>";
        results_desc_text.innerHTML += `<div class="point"><h2>${Math.round(crCl2)}<small class="ss">mL/min</small></h2><div style="font-size: 12px;">Creatinine clearance modified for overweight patient, using adjusted body weight of ${Math.round(abw)} kg (${Math.round(abw * 2.54)} lbs).</div></div>`;
        results_desc_text.innerHTML += "<div class='seppep'></div>";

        let crCl3 = (140 - formdata['age']) * ibw * sexMultiplier / (72 * formdata['creatinine']);
        let crCl4 = (140 - formdata['age']) * abw * sexMultiplier / (72 * formdata['creatinine']);
        results_desc_text.innerHTML += `<div class="point"><h2>${(crCl3).toFixed(1)} — ${(crCl4).toFixed(1)}<small class="ss">mL/min</small></h2><div style="font-size: 12px;">Note: This range uses IBW and adjusted body weight. Controversy exists over which form of weight to use.</div></div>`;

        bmi_case = `
${Math.round(crCl)} mL/min
Creatinine clearance modified for overweight patient, using adjusted body weight of ${Math.round(abw)} kg (${Math.round(abw * 2.54)} lbs).

${(crCl3).toFixed(1)} — ${(crCl4).toFixed(1)} mL/min
Note: This range uses IBW and adjusted body weight. Controversy exists over which form of weight to use.`;
    }
    changeHasResult(state.resultMode, crCl);
    state.currentResult = `RESULT SUMMARY:
${Math.round(crCl)} mL/min
Creatinine clearance, adjusted Cockcroft-Gault
${bmi_case}

INPUTS:
Sex —> ${formdata['sex']}
Age —> ${formdata['age']} years
Weight —> ${formdata['weight']} ${unitElements.weight.value}
Height —> ${formdata['height'] != NaN ? formdata['height'] : '?'} ${unitElements.height.value}
Serum creatinine —> ${formdata['creatinine']} ${unitElements.creatinine.value}`;
}

function calculateMDRD(formdata) {
    let f = (formdata['sex'] === "female") ? 0.742 : 1;
    let b = (formdata['black_race'] === "yes") ? 1.21 : 1;
    let v1 = 175 * Math.pow(formdata['creatinine'], -1.154) * Math.pow(formdata['age'], -0.203) * f * b;
    let r;
    if (formdata['black_race'] === null) {
        let b1 = 1;
        let b2 = 1.21;
        let v2 = v1 * b2 / b1;
        r = v1.toFixed(1) + "-" + v2.toFixed(1);
    } else {
        r = v1.toFixed(1);
    }
    results_desc_text.innerHTML = `<div class="point"><h2>${r}<small class="ss">mL/min/1.73 m²</small></h2><div>Glomerular Filtration Rate</div><div>by the MDRD Equation</div></div>`;
    changeHasResult(state.resultMode, v1);
    state.currentResult = `RESULT SUMMARY:
${r} mL/min/1.73 m²
Glomerular Filtration Rate by the MDRD Equation

INPUTS:
Sex —> ${formdata['sex']}
Black race —> ${formdata['black_race'] == null ? "?" : formdata['black_race']}
Age —> ${formdata['age']} years
Serum creatinine —> ${formdata['creatinine']} ${unitElements.creatinine.value}`;
}

function calculateCKD(formdata) {

    function determineCKDStage(eGFR) {
        if (eGFR >= 90) {
            return "Stage I";
        } else if (eGFR >= 60) {
            return "Stage II";
        } else if (eGFR >= 45) {
            return "Stage IIIa";
        } else if (eGFR >= 30) {
            return "Stage IIIb";
        } else if (eGFR >= 15) {
            return "Stage IV";
        } else {
            return "Stage IV";
        }
    }

    // Constants for the CKD-EPI Creatinine-Cystatin C 2021 equation
    let scr = formdata['creatinine'];
    let scys = formdata['cystatin'];
    let f = 1;
    if (formdata['sex'] === "female") {
        f = 0.963;
    }

    let scrThreshold = formdata['sex'] === 'female' ? 0.7 : 0.9;
    let A = formdata['sex'] === 'female' ? 0.7 : 0.9;
    let C = 0.8;
    let B = 0;
    let D = 0;

    if (scys <= 0.8) {
        B = scr <= scrThreshold ? -0.219 : -0.544;
        D = -0.323;
    } else {
        B = scr <= scrThreshold ? -0.219 : -0.544;
        D = -0.778;
    }

    let g = 135 * Math.pow((scr / A), B) * Math.pow((scys / C), D) * Math.pow(0.9961, formdata['age']) * f;

    // Output the results
    results_desc_text.innerHTML = `<div class="point"><h2>${Math.round(g)}<small class="ss">mL/min/1.73 m²</small></h2><div>Estimated GFR</div><div>2021 CKD-EPI Creatinine-Cystatin C</div></div>`;
    results_desc_text.innerHTML += "<div class='seppep'></div>";
    results_desc_text.innerHTML += `<div class="point"><h2>${determineCKDStage(g)}</h2><div>CKD stage by CKD-EPI Creatinine</div></div>`;
    changeHasResult(state.resultMode, g);
    state.currentResult = `RESULT SUMMARY:
${Math.round(g)} mL/min/1.73 m²
Estimated GFR by 2021 CKD-EPI Creatinine-Cystatin C

${determineCKDStage(g)} CKD stage by CKD-EPI Creatinine


INPUTS:
Sex —> ${formdata['sex']}
Age —> ${formdata['age']}
Serum creatinine —> ${formdata['creatinine']} ${unitElements.creatinine.value}
Serum cystatin C —> ${formdata['cystatin']} mg/L`;

}


function noFields() {
    changeHasResult(false);
    document.getElementById("result-box").innerHTML = `<div>
        <div class="result">Result:</div>
        <div class="please-fill-out">Please fill out required fields.</div>
    </div>`;
}

export function calcCreatineClearence() {
    const formdata = collectFormData();
    console.log(123);

    switch (state.resultMode) {
        case 'gault':
            if (formdata['sex'] != null && !isNaN(formdata['weight']) && !isNaN(formdata['creatinine']) && !isNaN(formdata['age'])) {
                calculateGault(formdata);

            } else {
                noFields();
            }
            break;
        case 'mdrd':
            if (formdata['sex'] != null && !isNaN(formdata['creatinine']) && !isNaN(formdata['age'])) {
                calculateMDRD(formdata);

            } else {
                noFields();
            }
            break;
        case 'ckd':
            if (formdata['sex'] != null && !isNaN(formdata['creatinine']) && !isNaN(formdata['cystatin']) && !isNaN(formdata['age'])) {
                calculateCKD(formdata);

            } else {
                noFields();
            }
            break;
    }
}