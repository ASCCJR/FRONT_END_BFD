const form = document.querySelector('#loan-form');
const amountInput = document.querySelector('#amount');
const installmentsInput = document.querySelector('#installments');
const interestInput = document.querySelector('#interest');
const feedback = document.querySelector('#feedback');
const resultsSection = document.querySelector('#results');
const totalToPayField = document.querySelector('#total-to-pay');
const monthlyPaymentField = document.querySelector('#monthly-payment');
const scheduleBody = document.querySelector('#schedule-body');
const scheduleWrapper = document.querySelector('#schedule-wrapper');

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL'
});

const decimalFormatters = new Map();

amountInput.addEventListener('input', handleAmountInput);
amountInput.addEventListener('blur', finalizeAmountFormatting);

form.addEventListener('submit', (event) => {
	event.preventDefault();

	const amount = getAmountValue();
	const installments = Number(installmentsInput.value);
	const interestRatePercent = Number(interestInput.value);

	const validationMessage = validateInputs(amount, installments, interestRatePercent);

	if (validationMessage) {
		showFeedback(validationMessage, 'danger');
		toggleVisibility(false);
		return;
	}

	clearFeedback();

	const interestRate = interestRatePercent / 100;
	const monthlyPayment = calculateMonthlyPayment(amount, installments, interestRate);
	const monthlyPaymentRounded = roundCurrency(monthlyPayment);
	const totalToPay = roundCurrency(monthlyPaymentRounded * installments);

	totalToPayField.textContent = currencyFormatter.format(totalToPay);
	monthlyPaymentField.textContent = currencyFormatter.format(monthlyPaymentRounded);

	renderSchedule(amount, installments, interestRate, monthlyPaymentRounded);
	toggleVisibility(true);
});

function handleAmountInput(event) {
	const rawValue = event.target.value;

	if (!rawValue.trim()) {
		amountInput.value = '';
		return;
	}

	const sanitizedValue = rawValue.replace(/[^\d.,]/g, '');
	const lastChar = sanitizedValue.slice(-1);
	const trailingSeparator = lastChar === ',' || lastChar === '.';
	const parsed = parseCurrencyInput(sanitizedValue);

	if (!parsed) {
		const digitsOnly = sanitizedValue.replace(/\D/g, '');
		amountInput.value = digitsOnly ? formatDecimal(Number(digitsOnly), 0) : '';
		return;
	}

	const formattedValue = formatDecimal(parsed.number, parsed.decimals);

	if (trailingSeparator && parsed.decimals === 0) {
		const separator = lastChar === '.' ? ',' : lastChar;
		amountInput.value = `${formattedValue}${separator}`;
		return;
	}

	amountInput.value = formattedValue;
}

function finalizeAmountFormatting() {
	const parsed = parseCurrencyInput(amountInput.value);

	if (!parsed) {
		amountInput.value = '';
		return;
	}

	amountInput.value = formatDecimal(parsed.number, parsed.decimals);
}

function getAmountValue() {
	const parsed = parseCurrencyInput(amountInput.value);
	return parsed ? parsed.number : NaN;
}

function validateInputs(amount, installments, interestRatePercent) {
	if (!Number.isFinite(amount) || amount <= 0) {
		return 'Informe um valor de empréstimo maior que zero.';
	}

	if (!Number.isInteger(installments) || installments < 1 || installments > 36) {
		return 'A quantidade de parcelas deve ser um número inteiro entre 1 e 36.';
	}

	if (!Number.isFinite(interestRatePercent) || interestRatePercent < 0) {
		return 'A taxa de juros deve ser um número maior ou igual a zero.';
	}

	return '';
}

function calculateMonthlyPayment(amount, installments, interestRate) {
	if (interestRate === 0) {
		return amount / installments;
	}

	const factor = Math.pow(1 + interestRate, installments);
	return (amount * interestRate * factor) / (factor - 1);
}

function renderSchedule(amount, installments, interestRate, monthlyPayment) {
	scheduleBody.innerHTML = '';

	const fragment = document.createDocumentFragment();
	let remainingBalance = amount;

	for (let installmentNumber = 1; installmentNumber <= installments; installmentNumber += 1) {
		const row = document.createElement('tr');
		const interestPortion = interestRate > 0 ? roundCurrency(remainingBalance * interestRate) : 0;
		let paymentThisInstallment = monthlyPayment;
		let amortizationPortion = roundCurrency(paymentThisInstallment - interestPortion);

		if (installmentNumber === installments) {
			amortizationPortion = roundCurrency(remainingBalance);
			paymentThisInstallment = roundCurrency(interestPortion + amortizationPortion);
			remainingBalance = 0;
		} else {
			remainingBalance = roundCurrency(Math.max(remainingBalance - amortizationPortion, 0));
		}

		appendCells(row, [
			installmentNumber,
			currencyFormatter.format(paymentThisInstallment),
			currencyFormatter.format(interestPortion),
			currencyFormatter.format(amortizationPortion),
			currencyFormatter.format(remainingBalance)
		]);

		fragment.appendChild(row);
	}

	scheduleBody.appendChild(fragment);
}

function createCell(content) {
	const cell = document.createElement('td');
	cell.textContent = content;
	return cell;
}

function appendCells(row, values) {
	values.forEach((value) => {
		row.appendChild(createCell(value));
	});
}

function showFeedback(message, type) {
	feedback.hidden = false;
	feedback.className = `alert alert-${type}`;
	feedback.textContent = message;
}

function clearFeedback() {
	feedback.hidden = true;
	feedback.className = '';
	feedback.textContent = '';
}

function toggleVisibility(show) {
	const hiddenState = !show;
	resultsSection.hidden = hiddenState;
	scheduleWrapper.hidden = hiddenState;
}

function roundCurrency(value) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parseCurrencyInput(value) {
	if (typeof value !== 'string') {
		return null;
	}

	const sanitized = value.replace(/[^\d.,]/g, '');

	if (!sanitized) {
		return null;
	}

	const { integerPart, fractionalPart } = splitCurrencyValue(sanitized);

	if (!integerPart && !fractionalPart) {
		return null;
	}

	const normalized = fractionalPart ? `${integerPart || '0'}.${fractionalPart}` : integerPart;
	const numericValue = Number(normalized);

	if (!Number.isFinite(numericValue)) {
		return null;
	}

	return {
		number: numericValue,
		decimals: fractionalPart.length
	};
}

function splitCurrencyValue(value) {
	if (value.includes(',')) {
		const normalized = value.replace(/\./g, '');
		const [integerSection, fractionalSection = ''] = normalized.split(',');

		return {
			integerPart: integerSection.replace(/\D/g, ''),
			fractionalPart: fractionalSection.replace(/\D/g, '').slice(0, 2)
		};
	}

	const dotMatches = value.match(/\./g) || [];

	if (dotMatches.length === 1) {
		const [integerSection, fractionalSection = ''] = value.split('.');
		const fractionalDigits = fractionalSection.replace(/\D/g, '');

		if (fractionalDigits.length > 0 && fractionalDigits.length <= 2) {
			return {
				integerPart: integerSection.replace(/\D/g, ''),
				fractionalPart: fractionalDigits
			};
		}
	}

	return {
		integerPart: value.replace(/\D/g, ''),
		fractionalPart: ''
	};
}

function formatDecimal(numberValue, decimalsCount) {
	const fractionDigits = Math.min(Math.max(decimalsCount ?? 0, 0), 2);

	if (!decimalFormatters.has(fractionDigits)) {
		decimalFormatters.set(
			fractionDigits,
			new Intl.NumberFormat('pt-BR', {
				minimumFractionDigits: fractionDigits,
				maximumFractionDigits: fractionDigits
			})
		);
	}

	return decimalFormatters.get(fractionDigits).format(numberValue);
}
