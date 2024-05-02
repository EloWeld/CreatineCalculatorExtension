import {
    state, inputs, unitElements, modeButtons, rg_sex, sexButtons, rg_race, raceButtons, actionButtons, separators
} from "./ui.js";

import {calcCreatineClearence, changeHasResult} from "./evidences.js";


//———————————————————————————————————————————————————————————————————————————————————————— //
//————————————————————————————————————   FUNCTIONS    ———————————————————————————————————— //
//———————————————————————————————————————————————————————————————————————————————————————— //
function changeMode(result_mode, highlights = true) {
    state.lastResult = null;
    Object.values(modeButtons).forEach((e) => e.classList.remove('segmented-unit-checked'));
    separators.mode[0].style.display = "none";
    separators.mode[1].style.display = "none";

    $(".highlight").removeClass("highlight");

    if (result_mode == "gault") {
        modeButtons.gault.classList.add('segmented-unit-checked');
        separators.mode[1].style.display = "block";
        if (highlights) {
            [inputs.age, rg_sex, inputs.creatinine, inputs.weight, inputs.height].forEach((e) => { if (!e.value) e.classList.add("highlight") });
        }
    }
    if (result_mode == "mdrd") {
        modeButtons.mdrd.classList.add('segmented-unit-checked');
        if (highlights) {
            [inputs.age, rg_sex, inputs.creatinine].forEach((e) => { if (!e.value) e.classList.add("highlight") });
        }
    }
    if (result_mode == "ckd") {
        modeButtons.ckd.classList.add('segmented-unit-checked');
        separators.mode[0].style.display = "block";
        if (highlights) {
            [inputs.age, rg_sex, inputs.creatinine, inputs.cystatin].forEach((e) => { if (!e.value) e.classList.add("highlight") });
        }
    }
}

function changeUnits(input, button, unitConfig) {
    let currentValue = parseFloat(input.value);
    let newValue, newMin, newMax, newPlaceholder, toFixed;

    // Переключение единиц измерения
    if (unitConfig.currentUnit === unitConfig.first.unit) {
        [unitConfig.currentUnit, newValue, newMin, newMax, newPlaceholder, toFixed] =
            [unitConfig.second.unit, currentValue * unitConfig.second.conversion, ...unitConfig.second.range, unitConfig.second.placeholder, unitConfig.second.toFixed];
    } else {
        [unitConfig.currentUnit, newValue, newMin, newMax, newPlaceholder, toFixed] =
            [unitConfig.first.unit, currentValue * unitConfig.first.conversion, ...unitConfig.first.range, unitConfig.first.placeholder, unitConfig.first.toFixed];
    }

    // Обновление атрибутов и значения элемента input
    input.setAttribute('placeholder', newPlaceholder);
    if (input.value) {
        input.value = newValue.toFixed(toFixed);
        input.setAttribute('min', newMin);
        input.setAttribute('max', newMax);
    }

    // Обновление текста на кнопке
    button.innerText = unitConfig.currentUnit;

    // Сохранение новой единицы измерения и пересчет значений
    evaluateResults();
    localStorage.setItem(button.id, unitConfig.currentUnit);
}

// Конфигурация для переключения единиц измерения
const unitConfigs = {
    weight: {
        currentUnit: "kg",
        first: { unit: "kg", conversion: 0.45359237, range: [1, 150], placeholder: "1-150", toFixed: 0 },
        second: { unit: "lbs", conversion: 2.20462, range: [2, 330], placeholder: "2-330", toFixed: 1 }
    },
    height: {
        currentUnit: "cm",
        first: { unit: "cm", conversion: 0.393701, range: [152, 213], placeholder: "152-213", toFixed: 1 },
        second: { unit: "in", conversion: 2.54, range: [60, 84], placeholder: "60-84", toFixed: 0 }
    },
    creatinine: {
        currentUnit: "mg/dL",
        first: { unit: "mg/dL", conversion: 88.4, range: [0.7, 1.3], placeholder: "0.7-1.3", toFixed: 0 },
        second: { unit: "µmol/L", conversion: 0.0113122, range: [62, 115], placeholder: "62-115", toFixed: 3 }
    }
};
//———————————————————————————————————————————————————————————————————————————————————————— //
//————————————————————————————————————    TOOLTIP     ———————————————————————————————————— //
//———————————————————————————————————————————————————————————————————————————————————————— //


document.getElementById('black_question').addEventListener('mouseover', function (e) {
    var tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'block';
});

document.getElementById('black_question').addEventListener('mouseout', function () {
    document.getElementById('tooltip').style.display = 'none';
});


//———————————————————————————————————————————————————————————————————————————————————————— //
//———————————————————————————————————— ACTION BUTTONS ———————————————————————————————————— //
//———————————————————————————————————————————————————————————————————————————————————————— //
// Copy result to clipboard
function copyResultsToClipboard() {
    const resultToCopy = inputs.resultsText.textContent;
    navigator.clipboard.writeText(resultToCopy).then(() => {
        console.log('Copying to clipboard was successful!');
    }, (err) => {
        console.error('Could not copy text: ', err);
    });

    if (!state.starsClicked) {
        console.log(state.resultsCalculated, "Result copied when stars not clicked");
        state.lastTimeStarsViewed = Date.now();
        localStorage.setItem("lastTimeStarsViewed", state.lastTimeStarsViewed.toString());
        window.location.href = "./thx_page.html";
    }
}

// Clear Results
function clearInputs() {
    document.querySelectorAll(".highlight").forEach(element => element.classList.remove("highlight"));
    Object.values(inputs).forEach(input => input.value = '');
    Object.values(sexButtons).concat(Object.values(raceButtons)).forEach(button => button.classList.remove('segmented-unit-checked'));
    state.sex = null;
    state.race = null;
    changeHasResult(false);
    document.getElementById("result-box").innerHTML = `<div>
        <div class="result">Result:</div>
        <div class="please-fill-out">Please fill out required fields.</div>
    </div>`;
    saveToLocalStorage();
}


//———————————————————————————————————————————————————————————————————————————————————————— //
//————————————————————————————————————   VALIDATIONS  ———————————————————————————————————— //
//———————————————————————————————————————————————————————————————————————————————————————— //
function validateNumberInput(event) {
    const input = event.target;
    const value = parseFloat(input.value, 10);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);

    if (min > value || value > max) {
        input.classList.add("error");
    } else {
        input.classList.remove("error");
    }
    console.log(input, value, min, max);
}

function formChanged() {
    calcCreatineClearence();
    saveToLocalStorage();
}

// Evaluate Results for current formula
function evaluateResults() {
    changeHasResult(false);
    calcCreatineClearence();
}


//———————————————————————————————————————————————————————————————————————————————————————— //
//———————————————————————————————————— INITIALIZATION ———————————————————————————————————— //
//———————————————————————————————————————————————————————————————————————————————————————— //
// Jquery

$(document).on("mouseenter", ".highlight", function () {
    $(this).toggleClass("highlight");
});
$(document).on("focus", ".highlight", function () {
    $(this).toggleClass("highlight");
});

// Event handlers
function setupEventListeners() {
    Object.values(sexButtons).forEach(button => {
        button.addEventListener('click', () => {
            state.sex = button.id.includes('female') ? 'female' : 'male';
            separators.sex.style.display = "none";
            sexButtons.male.classList.toggle('segmented-unit-checked', state.sex === 'male');
            sexButtons.female.classList.toggle('segmented-unit-checked', state.sex === 'female');
            rg_sex.value = state.sex;
            formChanged();
        });
    });

    Object.values(raceButtons).forEach(button => {
        button.addEventListener('click', () => {
            state.race = button.id.includes('yes') ? 'yes' : 'no';
            separators.race.style.display = "none";
            raceButtons.yes.classList.toggle('segmented-unit-checked', state.race === 'yes');
            raceButtons.no.classList.toggle('segmented-unit-checked', state.race === 'no');
            rg_race.value = state.race;
            formChanged();
        });
    });

    Object.values(modeButtons).forEach(button => {
        button.addEventListener('click', () => {
            state.resultMode = button.id.split('_')[2];
            changeMode(state.resultMode);
            formChanged();
        });
    });

    // Unit changers
    unitElements.weight.parentNode.addEventListener('click', () => changeUnits(inputs.weight, unitElements.weight, unitConfigs.weight));
    unitElements.height.parentNode.addEventListener('click', () => changeUnits(inputs.height, unitElements.height, unitConfigs.height));
    unitElements.creatinine.parentNode.addEventListener('click', () => changeUnits(inputs.creatinine, unitElements.creatinine, unitConfigs.creatinine));

    actionButtons.clear.addEventListener('click', clearInputs);
    actionButtons.copy.addEventListener('click', copyResultsToClipboard);

    Object.values(inputs).forEach(input => {
        input.addEventListener('keyup', formChanged);
    });
}

// Валидация ввода для полей с числовыми значениями
function setupNumberInputValidation() {
    document.querySelectorAll("input[type='number']").forEach(input => {
        input.addEventListener('input', validateNumberInput);
        input.addEventListener('change', validateNumberInput);
    });
}


// Initialization from localStorage
function initializeAppState() {
    state.sex = localStorage.getItem('sex');
    state.race = localStorage.getItem('race');

    Object.keys(unitElements).forEach(key => {
        let storedValue = localStorage.getItem(key + '_units');
        if (storedValue) {
            unitElements[key].textContent = storedValue;
            unitElements[key].value = storedValue;
        }
    });
    Object.keys(inputs).forEach(key => {
        console.log(key)
        let storedValue = localStorage.getItem(key);
        if (storedValue) {
            inputs[key].value = storedValue;
        }
    });
}

function initializeAfterListeners() {
    if (state.sex)
        sexButtons[state.sex].click()
    if (state.race != null)
        raceButtons[state.race].click()

}

// Save data into localStorage
function saveToLocalStorage() {
    Object.entries(inputs).forEach(([key, input]) => {
        localStorage.setItem(key, input.value);
    });
    localStorage.setItem('sex', state.sex);
    localStorage.setItem('race', state.race);
    localStorage.setItem('resultMode', state.resultMode);
}

// Initialization of script
function initialize() {
    initializeAppState();
    setupEventListeners();
    initializeAfterListeners();
    setupNumberInputValidation();

    evaluateResults(); // Initializing fields check and results evaluating
}

initialize();
