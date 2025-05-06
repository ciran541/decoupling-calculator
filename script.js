function formatMoney(amount) {
  const absAmount = Math.abs(amount);
  const formatted = "$" + absAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  return amount < 0 ? "-" + formatted : formatted;
}

function formatNumberWithCommas(value) {
  if (!value) return "";
  const number = parseFloat(value.replace(/,/g, ""));
  if (isNaN(number)) return value;
  return number.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function parseFormattedNumber(value) {
  return parseFloat(value.replace(/,/g, "")) || 0;
}

function calculateMonthlyInstallment(principal, rate, years) {
  const monthlyRate = rate / 12 / 100;
  const months = years * 12;
  if (monthlyRate === 0) return principal / months;
  return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
}

function calculateBSD(value) {
  let bsd = 0;
  if (value <= 180000) return value * 0.01;
  bsd += 180000 * 0.01;
  value -= 180000;
  if (value <= 180000) return bsd + value * 0.02;
  bsd += 180000 * 0.02;
  value -= 180000;
  if (value <= 640000) return bsd + value * 0.03;
  bsd += 640000 * 0.03;
  value -= 640000;
  if (value <= 500000) return bsd + value * 0.04;
  bsd += 500000 * 0.04;
  value -= 500000;
  if (value <= 1500000) return bsd + value * 0.05;
  bsd += 1500000 * 0.05;
  value -= 1500000;
  return bsd + value * 0.06;
}

function calculateABSD(value, residency) {
  switch (residency) {
    case 'Singaporean': return 0;
    case 'PR': return value * 0.05;
    case 'Foreigner': return value * 0.60;
    default: return 0;
  }
}

function calculateSSD(value, yearsOwned) {
  const rates = [0.12, 0.08, 0.04, 0];
  return value * rates[parseInt(yearsOwned)];
}

function calculateValuationFee(propertyValuation) {
  if (propertyValuation < 1000000) {
    return 300;
  } else if (propertyValuation < 2000000) {
    return '$400 est';
  } else {
    return '$400 onwards';
  }
}

// Validation Functions
function validatePropertyValuation(value) {
  if (!value || isNaN(value)) return "Please enter a valid valuation";
  if (value < 100000) return "Valuation must be at least S$100,000";
  return null;
}

function validateOutstandingLoan(value) {
  if (isNaN(value)) return "Please enter a valid loan amount";
  if (value < 0) return "Loan amount cannot be negative";
  return null;
}

function validateBuyerShare(value, sellerShare) {
  if (!value || isNaN(value)) return "Please enter a valid percentage";
  if (value < 1 || value > 99) return "Share must be between 1% and 99%";
  if (value + sellerShare !== 100) return "Buyer and Seller shares must total 100%";
  return null;
}

function validateBuyerAge(value) {
  if (!value || isNaN(value)) return "Please enter a valid age";
  if (value < 21) return "Age must be at least 21";
  if (value > 60) return "Age cannot exceed 60";
  return null;
}

function validateLTV(loan, valuation) {
  const ltv = (loan / valuation) * 100;
  if (ltv > 75) return "Loan amount exceeds 75% LTV limit";
  return null;
}

function validateCPFUsage(value) {
  if (isNaN(value)) return "Please enter a valid amount";
  if (value < 0) return "CPF usage cannot be negative";
  return null;
}

function validateCPFOaBalance(value) {
  if (isNaN(value)) return "Please enter a valid amount";
  if (value < 0) return "CPF OA Balance cannot be negative";
  return null;
}

function validateTotalFinancing(loan, buyerCpfUsage, sellerCpfUsage, valuation) {
  const totalFinancing = loan + buyerCpfUsage + sellerCpfUsage;
  const maxAllowedFinancing = valuation * 0.95;
  
  if (totalFinancing > maxAllowedFinancing) {
    return "Total financing (loan + CPF usage) cannot exceed 95% of property valuation";
  }
  return null;
}

// Pie Chart Creation
function createPieChart(loanPercent, cpfPercent, cashableEquityPercent, valuation) {
  // Ensure percentages are rounded to 1 decimal place for display
  // These percentages represent: loan, CPF used for property (NOT legal fees), and cashable equity
  loanPercent = parseFloat(loanPercent.toFixed(1));
  cpfPercent = parseFloat(cpfPercent.toFixed(1));
  cashableEquityPercent = parseFloat(cashableEquityPercent.toFixed(1));

  // Calculate actual dollar values
  const loanValue = (loanPercent / 100) * valuation;
  const cpfValue = (cpfPercent / 100) * valuation;
  const cashableEquityValue = (cashableEquityPercent / 100) * valuation;

  // Create canvas element for the chart
  const canvas = document.createElement('canvas');
  canvas.id = 'buyerPieChart';
  canvas.width = 300;
  canvas.height = 300;
  
  // Append canvas to the container
  const chartContainer = document.getElementById('pieChartContainer');
  chartContainer.innerHTML = '';
  chartContainer.appendChild(canvas);
  
  // Create the chart
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [
        `Cashable Equity (${cashableEquityPercent}% - ${formatMoney(cashableEquityValue)})`,
        `CPF (${cpfPercent}% - ${formatMoney(cpfValue)})`,
        `Loan (${loanPercent}% - ${formatMoney(loanValue)})`
      ],
      datasets: [{
        data: [cashableEquityPercent,cpfPercent,loanPercent],
        backgroundColor: [
          '#43a047',  // Green for Cashable Equity
          '#03a9e7',  // Light blue for CPF
          '#052d4a'  // Dark blue for loan
          
          
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'bottom',
        labels: {
          fontSize: 14,
          padding: 20
        }
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            return data.labels[tooltipItem.index];
          }
        }
      }
    }
  });
  
  // Update the pie chart note
  const pieChartNote = document.querySelector('.pie-chart-note');
  if (pieChartNote) {
    pieChartNote.innerHTML = `Based on your property valuation of ${formatMoney(valuation)}.`;
  }
}

// Main Logic
document.addEventListener('DOMContentLoaded', function() {
  // Load Chart.js if not already loaded
  if (typeof Chart === 'undefined') {
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js';
    document.head.appendChild(chartScript);
  }

  const inputs = {
    propertyValuation: document.getElementById('propertyValuation'),
    outstandingLoan: document.getElementById('outstandingLoan'),
    yearsSincePurchase: document.getElementById('yearsSincePurchase'),
    buyerShare: document.getElementById('buyerShare'),
    residency: document.querySelector('input[name="residency"]:checked'),
    buyerAge: document.getElementById('buyerAge'),
    sellerShare: document.getElementById('sellerShare'),
    cpfUsage: document.getElementById('cpfUsage'),
    buyerCpfUsage: document.getElementById('buyerCpfUsage'),
    buyerCpfOaBalance: document.getElementById('buyerCpfOaBalance')
  };

  const errors = {
    propertyValuation: document.getElementById('propertyValuationError'),
    outstandingLoan: document.getElementById('outstandingLoanError'),
    buyerShare: document.getElementById('buyerShareError'),
    buyerAge: document.getElementById('buyerAgeError'),
    sellerShare: document.getElementById('sellerShareError'),
    cpfUsage: document.getElementById('cpfUsageError'),
    buyerCpfUsage: document.getElementById('buyerCpfUsageError'),
    buyerCpfOaBalance: document.getElementById('buyerCpfOaBalanceError'),
    ltv: document.getElementById('ltvError') || document.createElement('div')
  };

  const labels = {
    propertyValuation: document.querySelector('label[for="propertyValuation"]'),
    outstandingLoan: document.querySelector('label[for="outstandingLoan"]'),
    buyerShare: document.querySelector('label[for="buyerShare"]'),
    buyerAge: document.querySelector('label[for="buyerAge"]'),
    sellerShare: document.querySelector('label[for="sellerShare"]'),
    cpfUsage: document.querySelector('label[for="cpfUsage"]'),
    buyerCpfUsage: document.querySelector('label[for="buyerCpfUsage"]'),
    buyerCpfOaBalance: document.querySelector('label[for="buyerCpfOaBalance"]')
  };

  // Format input fields on load
  ['propertyValuation', 'outstandingLoan', 'buyerShare', 'buyerAge', 'cpfUsage', 'buyerCpfUsage', 'buyerCpfOaBalance'].forEach(id => {
    if (inputs[id]) {
      inputs[id].value = formatNumberWithCommas(inputs[id].value);
    }
  });

  function updateSellerShare() {
    const buyerShare = parseFormattedNumber(inputs.buyerShare.value);
    inputs.sellerShare.value = formatNumberWithCommas((100 - buyerShare).toFixed(0));
  }

  function calculate() {
    const valuation = parseFormattedNumber(inputs.propertyValuation.value);
    const loan = parseFormattedNumber(inputs.outstandingLoan.value);
    const yearsOwned = inputs.yearsSincePurchase.value;
    const buyerSharePercent = parseFormattedNumber(inputs.buyerShare.value);
    const sellerSharePercent = parseFormattedNumber(inputs.sellerShare.value);
    const buyerShare = buyerSharePercent / 100;
    const sellerShare = sellerSharePercent / 100;
    const residency = document.querySelector('input[name="residency"]:checked').value;
    const age = parseFormattedNumber(inputs.buyerAge.value);
    const cpf = parseFormattedNumber(inputs.cpfUsage.value);
    const buyerCpfUsage = parseFormattedNumber(inputs.buyerCpfUsage.value);
    const buyerCpfOaBalance = parseFormattedNumber(inputs.buyerCpfOaBalance.value);

    // Validate inputs
    const validationErrors = [
      validatePropertyValuation(valuation),
      validateOutstandingLoan(loan),
      validateBuyerShare(buyerSharePercent, sellerSharePercent),
      validateBuyerAge(age),
      validateCPFUsage(cpf),
      validateCPFUsage(buyerCpfUsage),
      validateCPFOaBalance(buyerCpfOaBalance),
      validateLTV(loan, valuation),
      validateTotalFinancing(loan, buyerCpfUsage, cpf, valuation) // Add this new validation
    ].filter(error => error);

    Object.keys(errors).forEach(key => {
      if (errors[key]) {
        errors[key].style.display = 'none';
        labels[key]?.classList.remove('error');
      }
    });

    if (validationErrors.length > 0) {
      document.getElementById('error').style.display = 'block';
      document.getElementById('error').innerText = validationErrors.join(' | ');
      return;
    }

    document.getElementById('error').style.display = 'none';

    // Buyer Calculations
    const buyerPropertyShare = valuation * buyerShare;
    const buyerLoanLiability = loan * buyerShare;
    const purchasePrice = valuation * sellerShare;
    const cash5Percent = purchasePrice * 0.05;
    const cashCPF20Percent = purchasePrice * 0.20;
    const bankLoan75Percent = purchasePrice * 0.75;
    const newTotalLoan = buyerLoanLiability + bankLoan75Percent;
    const tenure = Math.min(30, 65 - age);
    const monthlyInstallment = calculateMonthlyInstallment(newTotalLoan, 2.5, tenure);
    const bsd = calculateBSD(purchasePrice);
    const absd = calculateABSD(purchasePrice, residency);
    const legalFees = 3000;
    const valuationFee = calculateValuationFee(valuation);

    // Calculate how much CPF can be used for downpayment
    const cpfNeeded = cashCPF20Percent;
    const cpfUsedForDownpayment = Math.min(buyerCpfOaBalance, cpfNeeded);
    const cashTopupForDownpayment = cpfNeeded - cpfUsedForDownpayment;
    
    // Calculate total cash required
    const totalCashRequired = cash5Percent + cashTopupForDownpayment + bsd + absd + 
                             (typeof valuationFee === 'number' ? valuationFee : 400); // Estimated valuation fee
    
    // Calculate CPF usage for legal fees
    const cpfRemainingAfterDownpayment = buyerCpfOaBalance - cpfUsedForDownpayment;
    const cpfUsedForLegalFees = Math.min(cpfRemainingAfterDownpayment, legalFees);
    const cashTopupForLegalFees = legalFees - cpfUsedForLegalFees;
    
    // Add legal fees to total cash required if not enough CPF
    const totalCashRequiredWithLegal = totalCashRequired + cashTopupForLegalFees;

    // Calculate percentages for pie chart
    // Note: CPF for legal fees is NOT included in the pie chart calculation
    const loanPercent = (newTotalLoan / valuation) * 100;
    const totalCpfUsed = buyerCpfUsage + cpfUsedForDownpayment; // Only CPF used towards property
    const cpfPercent = (totalCpfUsed / valuation) * 100;
    const cashableEquityPercent = 100 - loanPercent - cpfPercent;

    // Seller Calculations
    const sellerPropertyShare = valuation * sellerShare;
    const sellerLoanLiability = loan * sellerShare;
    const sellingPrice = valuation * sellerShare;
    const ssd = calculateSSD(sellingPrice, yearsOwned);
    const sellerLegalFees = 3000;
    const cashProceeds = sellingPrice - sellerLoanLiability - cpf;

    // Render Results with enhanced UI
    const results = document.getElementById('results');
    
    if (!valuation || valuation <= 0) {
      results.innerHTML = `
        <div class="results-header">
          <h2 class="section-title">Decoupling Results</h2>
          <p class="results-subtitle">Enter your property details above to see the breakdown</p>
        </div>
        
        <div class="initial-message">
          <div class="initial-message-icon">
            <img src="https://loan-eligibility.vercel.app/image/calculator_icon.png" alt="Calculator Icon">
          </div>
          <div class="initial-message-content">
            <div class="initial-message-title">Decoupling Calculator</div>
            <div class="initial-message-description">
              Enter the decoupling details above to estimate costs for both buyer and seller. Results will update automatically as you input values.
            </div>
          </div>
        </div>
      `;
      return;
    }

    results.innerHTML = `
      <div class="results-header">
        <h2 class="section-title">Decoupling Results</h2>
        <div class="disclaimer">
          The approach illustrated below assumes that you intend to take financing for the part-purchase. This is just one of several ways to structure a decoupling. Taking new financing is not mandatory — other alternatives such as an additional term loan or tenure extension may also be available. Contact us <a href="https://theloanconnection.com.sg/loan-application-form/?enquiry=coupling" target="_blank" style="color: var(--primary-color); text-decoration: underline; font-weight: 500; transition: color 0.2s ease;" onmouseover="this.style.color='var(--primary-color-dark, color-mix(in srgb, var(--primary-color) 80%, black))'" onmouseout="this.style.color='var(--primary-color)'">here</a> to find out more.
        </div>
      </div>
      
      <div class="results-container">
        <div class="result-card buyer-card">
          <div class="result-card-header">
            <div class="result-card-icon">
              <img src="https://loan-eligibility.vercel.app/image/TLC_Square.png" alt="Buyer Icon">
            </div>
            <h3 class="result-card-title">Buyer's Perspective</h3>
          </div>
          
          <div class="result-section">
            <div class="result-row">
              <span class="result-label">Property Share <span class="support-text">(${buyerSharePercent}% of Valuation)</span></span>
              <span class="result-value">${formatMoney(buyerPropertyShare)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Loan Liability <span class="support-text">(${buyerSharePercent}% of Outstanding Loan)</span></span>
              <span class="result-value">${formatMoney(buyerLoanLiability)}</span>
            </div>
          </div>
          
          <div class="result-section">
            <h4 class="result-section-title">Breakdown</h4>
            <div class="result-row highlight">
              <span class="result-label">Purchase of Part Share <span class="support-text">(${sellerSharePercent}% Share)</span></span>
              <span class="result-value primary">${formatMoney(purchasePrice)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">5% Cash</span>
              <span class="result-value">${formatMoney(cash5Percent)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">20% Cash/CPF</span>
              <span class="result-value">${formatMoney(cashCPF20Percent)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">75% Bank Loan</span>
              <span class="result-value">${formatMoney(bankLoan75Percent)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">New Total Loan<div class="support-text block-support-text">(incl. current loan liability)</div></span>
              <span class="result-value">${formatMoney(newTotalLoan)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Tenure</span>
              <span class="result-value">${tenure} years</span>
            </div>
            <div class="result-row highlight">
              <span class="result-label">Monthly Instalment<div class="support-text block-support-text">(Using 2.5% p.a reference rate)</div></span>
              <span class="result-value important">${formatMoney(monthlyInstallment)}</span>
            </div>
          </div>
          
          <div class="result-section">
            <h4 class="result-section-title">Est. Misc Fees</h4>
            <div class="result-row">
              <span class="result-label">Buyer's Stamp Duty (Cash)</span>
              <span class="result-value">${formatMoney(bsd)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Additional Buyer's Stamp Duty (Cash)</span>
              <span class="result-value">${formatMoney(absd)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Legal Fee (Cash/CPF)</span>
              <span class="result-value">${formatMoney(legalFees)} +/-</span>
            </div>
            <div class="result-row">
              <span class="result-label">Valuation Fee (Cash)</span>
              <span class="result-value">${typeof valuationFee === 'number' ? formatMoney(valuationFee) : valuationFee}</span>
            </div>
          </div>
          
          <div class="result-section">
            <h4 class="result-section-title">SUMMARY</h4>
            <div class="result-row highlight">
              <span class="result-label">Total Cash Required</span>
              <span class="result-value important">${formatMoney(totalCashRequiredWithLegal)} est</span>
            </div>
            <div class="result-row">
              <span class="result-label">CPF Used for Downpayment</span>
              <span class="result-value">${formatMoney(cpfUsedForDownpayment)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">CPF Used for Legal Fees</span>
              <span class="result-value">${formatMoney(cpfUsedForLegalFees)}</span>
            </div>
          </div>
          
          <div class="result-section">
            <h4 class="result-section-title">SINGLE OWNERSHIP STRUCTURE</h4>
            <div id="pieChartContainer" class="pie-chart-container" style="height: 300px; width: 100%; margin: 20px 0;"></div>
            <div class="pie-chart-note" style="font-size: 12px; color: #666; text-align: center; margin-top: -10px;">
              Based on your property valuation of ${formatMoney(valuation)}.
            </div>
          </div>
        </div>
        
        <div class="result-card seller-card">
          <div class="result-card-header">
            <div class="result-card-icon">
              <img src="https://loan-eligibility.vercel.app/image/TLC_Square.png" alt="Seller Icon">
            </div>
            <h3 class="result-card-title">Seller's Perspective</h3>
          </div>
          
          <div class="result-section">
            <div class="result-row">
              <span class="result-label">Property Share <span class="support-text">(${sellerSharePercent}% of Valuation)</span></span>
              <span class="result-value">${formatMoney(sellerPropertyShare)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Loan Liability <span class="support-text">(${sellerSharePercent}% of Outstanding Loan)</span></span>
              <span class="result-value">${formatMoney(sellerLoanLiability)}</span>
            </div>
          </div>
          
          <div class="result-section">
            <h4 class="result-section-title">Breakdown</h4>
            <div class="result-row highlight">
              <span class="result-label">Sale of Property Share</span>
              <span class="result-value primary">${formatMoney(sellingPrice)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Less: Loan Liability</span>
              <span class="result-value">${formatMoney(sellerLoanLiability)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Less: CPF Usage <span class="support-text">(Refund to OA)</span></span>
              <span class="result-value">${formatMoney(cpf)}</span>
            </div>
            <div class="result-row highlight">
              <span class="result-label">Cash Proceeds</span>
              <span class="result-value ${cashProceeds < 0 ? 'negative' : 'important'}">${formatMoney(cashProceeds)}</span>
            </div>
          </div>
          
          <div class="result-section">
            <h4 class="result-section-title">Est. Misc Fees</h4>
            <div class="result-row">
              <span class="result-label">Seller's Stamp Duty (Cash)</span>
              <span class="result-value">${formatMoney(ssd)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Legal Fee (Cash/CPF)</span>
              <span class="result-value">${formatMoney(sellerLegalFees)} +/-</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="disclaimer">
        <strong>Disclaimer from TLC:</strong> Figures provided on this page are for illustration purposes and do not constitute as a formal approval from a bank.
      </div>
    `;
    
    // Create pie chart after DOM is updated
    setTimeout(() => {
      if (typeof Chart !== 'undefined') {
        createPieChart(loanPercent, cpfPercent, cashableEquityPercent, valuation);
      } else {
        // If Chart.js isn't loaded yet, wait a bit more
        setTimeout(() => {
          if (typeof Chart !== 'undefined') {
            createPieChart(loanPercent, cpfPercent, cashableEquityPercent, valuation);
          }
        }, 1000);
      }
    }, 100);
  }

  // Event Listeners for formatting inputs
  ['propertyValuation', 'outstandingLoan', 'buyerShare', 'buyerAge', 'cpfUsage', 'buyerCpfUsage', 'buyerCpfOaBalance'].forEach(id => {
    if (inputs[id]) {
      inputs[id].addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9,]/g, '');
        calculate();
      });
      inputs[id].addEventListener('blur', function() {
        this.value = formatNumberWithCommas(this.value);
        calculate();
      });
    }
  });

  // Event Listeners for calculations
  if (inputs.buyerShare) {
    inputs.buyerShare.addEventListener('input', () => {
      updateSellerShare();
      calculate();
    });
  }

  ['propertyValuation', 'outstandingLoan', 'yearsSincePurchase', 'buyerAge', 'cpfUsage', 'buyerCpfUsage', 'buyerCpfOaBalance'].forEach(id => {
    if (inputs[id]) {
      inputs[id].addEventListener('input', calculate);
    }
  });

  document.querySelectorAll('input[name="residency"]').forEach(radio => {
    radio.addEventListener('change', calculate);
  });

  // Input Validation
  Object.keys(inputs).forEach(key => {
    if (inputs[key] && key !== 'yearsSincePurchase' && key !== 'residency' && key !== 'sellerShare') {
      inputs[key].addEventListener('input', function() {
        const value = parseFormattedNumber(this.value);
        let error = null;

        switch (key) {
          case 'propertyValuation':
            error = validatePropertyValuation(value);
            break;
          case 'outstandingLoan':
            error = validateOutstandingLoan(value) || validateLTV(value, parseFormattedNumber(inputs.propertyValuation.value));
            break;
          case 'buyerShare':
            error = validateBuyerShare(value, parseFormattedNumber(inputs.sellerShare.value));
            break;
          case 'buyerAge':
            error = validateBuyerAge(value);
            break;
          case 'cpfUsage':
            error = validateCPFUsage(value);
            break;
          case 'buyerCpfUsage':
            error = validateCPFUsage(value);
            break;
          case 'buyerCpfOaBalance':
            error = validateCPFOaBalance(value);
            break;
        }

        if (error && errors[key]) {
          errors[key].textContent = error;
          errors[key].style.display = 'block';
          labels[key]?.classList.add('error');
        } else if (errors[key]) {
          errors[key].style.display = 'none';
          labels[key]?.classList.remove('error');
        }
      });
    }
  });

  // Initial calculation
  updateSellerShare();
  calculate();
});
// Iframe resizer
document.addEventListener('DOMContentLoaded', function() {
  function sendHeight() {
    const height = document.body.scrollHeight + 20;
    window.parent.postMessage({ type: 'setHeight', height: height }, '*');
  }
  
  const events = ['load', 'resize', 'input', 'change'];
  events.forEach(event => {
    window.addEventListener(event, sendHeight);
  });
  
  const observer = new MutationObserver(function() {
    setTimeout(sendHeight, 50);
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });
  
  window.addEventListener('message', function(event) {
    if (event.data.type === 'requestHeight') {
      sendHeight();
    }
  });
  
  setTimeout(sendHeight, 300);
  
  window.addEventListener('load', function() {
    setTimeout(sendHeight, 500);
  });
});