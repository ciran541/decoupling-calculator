function formatMoney(amount) {
  const absAmount = Math.abs(amount);
  const formatted = "$" + Math.round(absAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return amount < 0 ? "-" + formatted : formatted;
}

function formatNumberWithCommas(value) {
  if (!value) return "";
  const cleanedValue = value.replace(/[^0-9]/g, '');
  const number = parseFloat(cleanedValue);
  if (isNaN(number)) return value;
  return number.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPercentage(value) {
  if (!value) return "";
  const number = parseFloat(value);
  if (isNaN(number)) return value;
  return number.toFixed(2);
}

function parseFormattedNumber(value) {
  return parseFloat(value.replace(/,/g, "")) || 0;
}

function parsePercentage(value) {
  return parseFloat(value) || 0;
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

function validateInterestRate(value) {
  if (isNaN(value)) return "Please enter a valid interest rate";
  if (value <= 0) return "Interest rate must be greater than 0%";
  if (value > 10) return "Interest rate cannot exceed 10%";
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

function createPieChart(loanPercent, cpfPercent, cashableEquityPercent, valuation) {
  loanPercent = parseFloat(loanPercent.toFixed(1));
  cpfPercent = parseFloat(cpfPercent.toFixed(1));
  cashableEquityPercent = parseFloat(cashableEquityPercent.toFixed(1));
  
  const loanValue = (loanPercent / 100) * valuation;
  const cpfValue = (cpfPercent / 100) * valuation;
  const cashableEquityValue = (cashableEquityPercent / 100) * valuation;
  
  const canvas = document.createElement('canvas');
  canvas.id = 'buyerPieChart';
  canvas.width = 300;
  canvas.height = 300;
    
  const chartContainer = document.getElementById('pieChartContainer');
  chartContainer.innerHTML = '';
  chartContainer.appendChild(canvas);
    
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
        data: [cashableEquityPercent, cpfPercent, loanPercent],
        backgroundColor: [
          '#43a047',
          '#03a9e7',
          '#052d4a'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: 'bottom',
          align: 'start',
          labels: {
            font: {
              size: 14
            },
            padding: 20,
            boxWidth: 15
          },
          display: true
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label;
            }
          }
        }
      }
    }
  });
    
  const pieChartNote = document.querySelector('.pie-chart-note');
  if (pieChartNote) {
    pieChartNote.innerHTML = `Based on your property valuation of ${formatMoney(valuation)}.`;
  }
}

class IpaModal {
  constructor() {
    this.modal = document.getElementById('ipaModal');
    this.closeBtn = document.querySelector('.ipa-close');
    this.bottomIpaButton = document.getElementById('bottomIpaButton');
    this.form = document.getElementById('ipaForm');
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.originalButtonText = this.submitBtn ? this.submitBtn.innerHTML : 'Submit';
    this.isInIframe = window !== window.parent;
    this.modal.style.display = 'none';
    this.initializeEvents();
  }

  initializeEvents() {
    this.bottomIpaButton.addEventListener('click', () => {
      this.openModal();
    });

    this.closeBtn.addEventListener('click', () => this.closeModal());
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    if (this.isInIframe) {
      window.addEventListener('resize', () => this.handleResize());
    }
  }

  handleResize() {
    if (this.modal.style.display === 'block') {
      this.adjustModalPosition();
    }
  }

  adjustModalPosition() {
    const modalContent = this.modal.querySelector('.ipa-modal-content');
    if (window.innerWidth <= 768) {
      if (this.modal.style.display === 'block') {
        this.modal.style.top = '0';
        this.modal.style.height = '100%';
        this.modal.style.overflow = 'auto';
        if (modalContent) {
          modalContent.style.marginTop = '20px';
          modalContent.style.marginBottom = '20px';
          modalContent.style.maxHeight = 'none';
        }
      }
    } else {
      this.modal.style.top = '';
      this.modal.style.height = '';
      this.modal.style.overflow = '';
      if (modalContent) {
        modalContent.style.marginTop = '';
        modalContent.style.marginBottom = '';
        modalContent.style.maxHeight = '';
      }
    }
  }

  openModal() {
    if (this.isInIframe) {
      window.parent.postMessage({ type: 'showModal' }, '*');
      this.modal.style.display = 'block';
      this.adjustModalPosition();
    } else {
      this.modal.style.display = 'block';
    }
  }

  closeModal() {
    if (this.isInIframe) {
      window.parent.postMessage({ type: 'closeModal' }, '*');
    }
    this.modal.style.display = 'none';
    const modalContent = this.modal.querySelector('.ipa-modal-content');
    if (modalContent) {
      modalContent.style.marginTop = '';
      modalContent.style.marginBottom = '';
      modalContent.style.maxHeight = '';
    }
    this.form.reset();
    this.clearErrors();
  }

  validateForm() {
    let isValid = true;
    const name = document.getElementById('name');
    const email = document.getElementById('emailAddress');
    const mobile = document.getElementById('mobileNumber');

    if (!name.value.trim()) {
      this.showError(name, 'nameError', 'Name is required');
      isValid = false;
    }

    if (!email.value.trim()) {
      this.showError(email, 'emailError', 'Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.value)) {
      this.showError(email, 'emailError', 'Please enter a valid email address');
      isValid = false;
    }

    if (!mobile.value.trim()) {
      this.showError(mobile, 'mobileError', 'Mobile number is required');
      isValid = false;
    } else if (!/^[89]\d{7}$/.test(mobile.value)) {
      this.showError(mobile, 'mobileError', 'Please enter a valid Singapore mobile number');
      isValid = false;
    }

    return isValid;
  }

  showError(input, errorId, message) {
    const errorElement = document.getElementById(errorId);
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  clearErrors() {
    document.querySelectorAll('.ipa-error').forEach(error => {
      error.style.display = 'none';
    });
    document.querySelectorAll('.ipa-input-group input').forEach(input => {
      input.classList.remove('error');
    });
  }

  getDecouplingDetails() {
    const inputs = {
      propertyValuation: document.getElementById('propertyValuation').value,
      outstandingLoan: document.getElementById('outstandingLoan').value,
      yearsSincePurchase: document.getElementById('yearsSincePurchase').value,
      buyerShare: document.getElementById('buyerShare').value,
      sellerShare: document.getElementById('sellerShare').value,
      residency: document.querySelector('input[name="residency"]:checked').value,
      buyerAge: document.getElementById('buyerAge').value,
      cpfUsage: document.getElementById('cpfUsage').value,
      buyerCpfUsage: document.getElementById('buyerCpfUsage').value,
      buyerCpfOaBalance: document.getElementById('buyerCpfOaBalance').value,
      interestRate: document.getElementById('interestRateInput')?.value || '2.5'
    };

    const results = {
      buyerPropertyShare: document.querySelector('.buyer-card .result-row:nth-child(1) .result-value')?.textContent || '-',
      buyerLoanLiability: document.querySelector('.buyer-card .result-row:nth-child(2) .result-value')?.textContent || '-',
      purchasePrice: document.querySelector('.buyer-card .result-row.highlight:nth-child(1) .result-value')?.textContent || '-',
      cash5Percent: document.querySelector('.buyer-card .result-row:nth-child(2) .result-value')?.textContent || '-',
      cashCPF20Percent: document.querySelector('.buyer-card .result-row:nth-child(3) .result-value')?.textContent || '-',
      bankLoan75Percent: document.querySelector('.buyer-card .result-row:nth-child(4) .result-value')?.textContent || '-',
      newTotalLoan: document.querySelector('.buyer-card .result-row:nth-child(5) .result-value')?.textContent || '-',
      tenure: document.querySelector('.buyer-card .result-row:nth-child(6) .result-value')?.textContent || '-',
      monthlyInstallment: document.querySelector('.buyer-card .result-row.highlight:nth-child(2) .result-value')?.textContent || '-',
      bsd: document.querySelector('.buyer-card .result-section:nth-child(3) .result-row:nth-child(1) .result-value')?.textContent || '-',
      absd: document.querySelector('.buyer-card .result-section:nth-child(3) .result-row:nth-child(2) .result-value')?.textContent || '-',
      legalFees: document.querySelector('.buyer-card .result-section:nth-child(3) .result-row:nth-child(3) .result-value')?.textContent || '-',
      valuationFee: document.querySelector('.buyer-card .result-section:nth-child(3) .result-row:nth-child(4) .result-value')?.textContent || '-',
      totalCashRequired: document.querySelector('.buyer-card .result-section:nth-child(4) .result-row:nth-child(1) .result-value')?.textContent || '-',
      cpfUsedForDownpayment: document.querySelector('.buyer-card .result-section:nth-child(4) .result-row:nth-child(2) .result-value')?.textContent || '-',
      cpfUsedForLegalFees: document.querySelector('.buyer-card .result-section:nth-child(4) .result-row:nth-child(3) .result-value')?.textContent || '-',
      sellerPropertyShare: document.querySelector('.seller-card .result-row:nth-child(1) .result-value')?.textContent || '-',
      sellerLoanLiability: document.querySelector('.seller-card .result-row:nth-child(2) .result-value')?.textContent || '-',
      sellingPrice: document.querySelector('.seller-card .result-section:nth-child(2) .result-row:nth-child(1) .result-value')?.textContent || '-',
      sellerCpfUsage: document.querySelector('.seller-card .result-section:nth-child(2) .result-row:nth-child(3) .result-value')?.textContent || '-',
      cashProceeds: document.querySelector('.seller-card .result-section:nth-child(2) .result-row:nth-child(4) .result-value')?.textContent || '-',
      ssd: document.querySelector('.seller-card .result-section:nth-child(3) .result-row:nth-child(1) .result-value')?.textContent || '-',
      sellerLegalFees: document.querySelector('.seller-card .result-section:nth-child(3) .result-row:nth-child(2) .result-value')?.textContent || '-'
    };

    return { ...inputs, ...results };
  }

  showNotification(type = 'success', title = 'Success!', message = 'Thank you! Your report is being processed and will arrive in your email shortly.') {
    if (this.isInIframe) {
      window.parent.postMessage({
        type: 'showNotification',
        notification: {
          type: type,
          title: title,
          message: message,
          icon: type === 'success' ?
            `<svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
            </svg>` :
            `<svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="#EF4444" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>`
        }
      }, '*');
    } else {
      const notification = document.getElementById('notification');
      const titleElement = notification.querySelector('.notification-title');
      const messageElement = notification.querySelector('.notification-description');
      const iconElement = notification.querySelector('.notification-icon');
      titleElement.textContent = title;
      messageElement.textContent = message;
      iconElement.innerHTML = type === 'success' ?
        `<svg viewBox="0 0 24 24" width="24" height="24">
           <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
         </svg>` :
        `<svg viewBox="0 0 24 24" width="24" height="24">
           <path fill="#EF4444" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
         </svg>`;
      notification.classList.add('show');
      setTimeout(() => notification.classList.remove('show'), 5000);
    }
  }

  showLoading() {
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = 'Almost there! Preparing your report...';
    }
  }

  hideLoading() {
    if (this.submitBtn) {
      this.submitBtn.disabled = false;
      this.submitBtn.innerHTML = this.originalButtonText;
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (this.validateForm()) {
      this.showLoading();

      try {
        const formData = new FormData(this.form);
        const decouplingDetails = this.getDecouplingDetails();
        const userName = formData.get('name');
        const userEmail = formData.get('emailAddress');
        
        // Create temporary container
        const captureContainer = document.createElement('div');
        captureContainer.className = 'pdf-capture-container';
        
        captureContainer.innerHTML = `
          <div class="pdf-header">
            <div class="company-info">
              <h1>The Loan Connection</h1>
              <h2>Getting The Right Mortgage</h2>
            </div>
            <div class="user-info">
              <p><strong>Prepared for:</strong> ${userName || 'Valued Customer'}</p>
              <p><strong>Email:</strong> ${userEmail || 'N/A'}</p>
              <p><strong>Generated on:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
        `;

        // Clone results section
        const resultsSection = document.querySelector('.results-section');
        const resultsClone = resultsSection.cloneNode(true);

        // Function to capture chart as image
        const captureChart = (chartId) => {
          return new Promise(async (resolve) => {
            const originalCanvas = document.getElementById(chartId);
            if (!originalCanvas) {
              resolve();
              return;
            }

            try {
              // Get chart instance
              let chartInstance = null;
              if (typeof Chart.getChart === 'function') {
                chartInstance = Chart.getChart(originalCanvas);
              } else if (originalCanvas.chart) {
                chartInstance = originalCanvas.chart;
              } else if (Chart.instances && Object.keys(Chart.instances).length > 0) {
                 // Find the instance associated with the canvas
                 for (const key in Chart.instances) {
                     if (Chart.instances[key].canvas === originalCanvas) {
                         chartInstance = Chart.instances[key];
                         break;
                     }
                 }
              }

              if (chartInstance) {
                // Use Chart.js's built-in method to get image data
                const chartImage = chartInstance.toBase64Image('image/png', 1.0);
                const clonedCanvas = resultsClone.querySelector(`#${chartId}`);
                if (clonedCanvas) {
                  const img = document.createElement('img');
                  img.src = chartImage;
                  img.style.width = '100%';
                  img.style.height = 'auto';
                  img.style.display = 'block';
                  img.style.margin = '0 auto';

                  // Create a container for the image
                  const container = document.createElement('div');
                  container.style.width = '100%';
                  container.style.textAlign = 'center';
                  container.appendChild(img);

                  // Replace the canvas with the container
                  clonedCanvas.parentNode.replaceChild(container, clonedCanvas);

                   // Wait for the image to load
                  await new Promise(resolve => {
                    if (img.complete) {
                      resolve();
                    } else {
                      img.onload = resolve;
                      img.onerror = resolve;
                    }
                  });
                }
              } else {
                 console.warn('Chart instance not found for canvas:', chartId);
              }
            } catch (error) {
              console.error('Error capturing chart:', error);
            }
            resolve();
          });
        };

        // Wait for Chart.js to be ready and chart to be rendered
        const waitForChart = () => {
          return new Promise((resolve) => {
            if (typeof Chart !== 'undefined') {
              // Add a small delay to ensure chart is rendered
              setTimeout(resolve, 500);
            } else {
              setTimeout(() => waitForChart().then(resolve), 100);
            }
          });
        };

        // Capture the pie chart after ensuring Chart.js is loaded
        await waitForChart();
        await captureChart('buyerPieChart');

        // Make all elements visible
        resultsClone.querySelectorAll('*').forEach(el => {
          if (window.getComputedStyle(el).display === 'none') {
            el.style.display = 'block';
          }
        });
        
        captureContainer.appendChild(resultsClone);
        
        // Wait for the pie chart image to load before capturing
        const chartImg = resultsClone.querySelector('#pieChartContainer img');
        if (chartImg) {
          await new Promise(resolve => {
            if (chartImg.complete) {
              resolve();
            } else {
              chartImg.onload = resolve;
              chartImg.onerror = resolve;
            }
          });
        }
        
        captureContainer.innerHTML += `
          <div class="pdf-footer">
            <hr>
            <p>This report was generated on ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            <p>For any questions, please contact our mortgage specialists at <a href="mailto:enquiry@theloanconnection.com.sg">enquiry@theloanconnection.com.sg</a></p>
          </div>
        `;
        
        // Add to document for capture
        document.body.appendChild(captureContainer);
        
        // Use original dimensions
        const width = Math.max(resultsClone.scrollWidth, 800);
        const height = Math.max(resultsClone.scrollHeight + 300, 4500);
        
        captureContainer.style.width = `${width}px`;
        
        // Capture content
        const canvas = await html2canvas(captureContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: width,
          height: height,
          windowWidth: width,
          windowHeight: height
        });
        
        // Remove temporary container
        document.body.removeChild(captureContainer);
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: width > height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [width, height]
        });
        
        // Add captured content to PDF
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, width, height, '', 'FAST');
        
        // Get base64 for submission
        const pdfBase64 = pdf.output('datauristring').split(',')[1];
        
        // Prepare submission data
        const submissionData = {
          timestamp: new Date().toISOString(),
          name: formData.get('name'),
          email: formData.get('emailAddress'),
          mobile: formData.get('mobileNumber'),
          pdfData: pdfBase64,
          ...decouplingDetails
        };

        // Submit to Google Apps Script
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwmP2XZ-Gugmi-IpFN4RtVnfd55iMWhcplFR30reSAhXAY90eWWCPyNsJl3DzEou3kggA/exec';
        const form = new FormData();
        
        Object.keys(submissionData).forEach(key => {
          form.append(key, submissionData[key]);
        });

        const response = await fetch(scriptURL, {
          method: 'POST',
          mode: 'no-cors',
          body: form
        });

        this.hideLoading();
        this.closeModal();
        
        this.showNotification(
          'success', 
          'Success!', 
          'Thank you! Your report is being processed and will arrive in your email shortly.'
        );
        
      } catch (error) {
        console.error('Error submitting form:', error);
        this.hideLoading();
        
        this.showNotification(
          'error',
          'Error',
          'Sorry, there was an error submitting your form. Please try again.'
        );
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const ipaModal = new IpaModal();

  // Add event delegation for the bottomIpaButton
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'bottomIpaButton') {
      ipaModal.openModal();
    }
  });

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
    interestRate: document.getElementById('interestRateError') || document.createElement('div'),
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
    buyerCpfOaBalance: document.querySelector('label[for="buyerCpfOaBalance"]'),
    interestRate: document.querySelector('label[for="interestRate"]')
  };

  if (inputs.sellerShare) {
    inputs.sellerShare.readOnly = true;
    inputs.sellerShare.style.backgroundColor = '#f0f0f0';
  }

  let interestRateValue = 2.5;

  ['propertyValuation', 'outstandingLoan', 'buyerShare', 'buyerAge', 'cpfUsage', 'buyerCpfUsage', 'buyerCpfOaBalance'].forEach(id => {
    if (inputs[id]) {
      inputs[id].value = formatNumberWithCommas(inputs[id].value);
    }
  });

  function updateSellerShare() {
    const buyerShare = parseFormattedNumber(inputs.buyerShare.value);
    const cappedBuyerShare = Math.min(buyerShare, 99);
    inputs.buyerShare.value = formatNumberWithCommas(cappedBuyerShare.toFixed(0));
    inputs.sellerShare.value = formatNumberWithCommas((100 - cappedBuyerShare).toFixed(0));
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
    const interestRate = interestRateValue;

    const validationErrors = [
      validatePropertyValuation(valuation),
      validateOutstandingLoan(loan),
      validateBuyerShare(buyerSharePercent, sellerSharePercent),
      validateBuyerAge(age),
      validateCPFUsage(cpf),
      validateCPFUsage(buyerCpfUsage),
      validateCPFOaBalance(buyerCpfOaBalance),
      validateInterestRate(interestRate),
      validateLTV(loan, valuation),
      validateTotalFinancing(loan, buyerCpfUsage, cpf, valuation)
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

    const buyerPropertyShare = valuation * buyerShare;
    const buyerLoanLiability = loan * buyerShare;
    const purchasePrice = valuation * sellerShare;
    const cash5Percent = purchasePrice * 0.05;
    const cashCPF20Percent = purchasePrice * 0.20;
    const bankLoan75Percent = purchasePrice * 0.75;
    const newTotalLoan = buyerLoanLiability + bankLoan75Percent;
    const tenure = Math.min(30, 65 - age);
    const monthlyInstallment = calculateMonthlyInstallment(newTotalLoan, interestRate, tenure);
    const bsd = calculateBSD(purchasePrice);
    const absd = calculateABSD(purchasePrice, residency);
    const legalFees = 3000;
    const valuationFee = calculateValuationFee(valuation);
    const cpfNeeded = cashCPF20Percent;
    const cpfUsedForDownpayment = Math.min(buyerCpfOaBalance, cpfNeeded);
    const cashTopupForDownpayment = cpfNeeded - cpfUsedForDownpayment;
    const totalCashRequired = cash5Percent + cashTopupForDownpayment + bsd + absd + 
                            (typeof valuationFee === 'number' ? valuationFee : 400);
    const cpfRemainingAfterDownpayment = buyerCpfOaBalance - cpfUsedForDownpayment;
    const cpfUsedForLegalFees = Math.min(cpfRemainingAfterDownpayment, legalFees);
    const cashTopupForLegalFees = legalFees - cpfUsedForLegalFees;
    const totalCashRequiredWithLegal = totalCashRequired + cashTopupForLegalFees;
    const loanPercent = (newTotalLoan / valuation) * 100;
    const totalCpfUsed = buyerCpfUsage + cpfUsedForDownpayment;
    const cpfPercent = (totalCpfUsed / valuation) * 100;
    const cashableEquityPercent = 100 - loanPercent - cpfPercent;
    const sellerPropertyShare = valuation * sellerShare;
    const sellerLoanLiability = loan * sellerShare;
    const sellingPrice = valuation * sellerShare;
    const ssd = calculateSSD(sellingPrice, yearsOwned);
    const sellerLegalFees = 3000;
    const cashProceeds = sellingPrice - sellerLoanLiability - cpf;

    const results = document.getElementById('results');
    
    if (!valuation || valuation <= 0) {
      results.innerHTML = `
        <div class="results-header">
          <h2 class="section-title">Decoupling Results</h2>
          <p class="results-subtitle">Enter your property details above to see the breakdown</p>
        </div>
        
        <div class="initial-message">
          <div class="initial-message-icon">
            <img src="https://theloanconnection.com.sg/wp-content/uploads/2025/04/stamp_duty_icon.png" alt="Calculator Icon">
          </div>
          <div class="initial-message-content">
            <div class="initial-message-title">Decoupling Calculator</div>
            <div class="initial-message-description">
              Enter the decoupling details above to estimate costs for both buyer and seller. Results will update automatically as you input values.
            </div>
          </div>
        </div>
        <div class="bottom-ipa-section">
          <div class="ipa-button-wrapper" style="max-width: 300px; margin: 2rem auto;">
            <button class="ipa-button" id="bottomIpaButton">Send me this report</button>
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
              <img src="./image/TLC_Square.png" alt="Buyer Icon">
            </div>
            <h3 class="result-card-title">Buyer's Perspective</h3>
          </div>
          
          <div class="result-section">
            <div class="result-row">
              <span class="result-label">Property Share <span class="support-text">(${buyerSharePercent}% of Valuation)</span></span>
              <span class="result-value">${formatMoney(buyerPropertyShare)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Loan Liability <span class="support-text">(${buyerSharePercent}% of Outstanding Loan)</span><div class="support-text-lo block-support-text">-Applicable to non-borrower</div></span>
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
            <div class="result-row">
              <span class="result-label">Interest Rate (% p.a)</span>
              <span class="result-value">
                <input type="text" id="interestRateInput" value="${formatPercentage(interestRate)}" style="width: 80px; padding: 5px; border: 1px solid #ccc; border-radius: 4px; text-align: right;" />
                <div id="interestRateError" style="display: none; color: red; font-size: 12px;"></div>
              </span>
            </div>
            <div class="result-row highlight">
              <span class="result-label">Monthly Instalment</span>
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
            <div id="pieChartContainer" class="pie-chart-container" style="width: 100%; margin: 20px 0;"></div>
            <div class="pie-chart-note" style="font-size: 12px; color: #666; text-align: center; margin-top: -10px;">
              Based on your property valuation of ${formatMoney(valuation)}.
            </div>
          </div>
        </div>
        
        <div class="result-card seller-card">
          <div class="result-card-header">
            <div class="result-card-icon">
              <img src="./image/TLC_Square.png" alt="Seller Icon">
            </div>

            <h3 class="result-card-title">Seller's Perspective</h3>
          </div>
          
          <div class="result-section">
            <div class="result-row">
              <span class="result-label">Property Share <span class="support-text">(${sellerSharePercent}% of Valuation)</span></span>
              <span class="result-value">${formatMoney(sellerPropertyShare)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Loan Liability <span class="support-text">(${sellerSharePercent}% of Outstanding Loan)</span><div class="support-text-lo block-support-text">-Applicable to non-borrower</div></span>
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
      
      <div class="bottom-ipa-section">
        <div class="ipa-button-wrapper" style="max-width: 300px; margin: 2rem auto;">
          <button class="ipa-button" id="bottomIpaButton">Send me this report</button>
        </div>
      </div>
    `;
    
    setTimeout(() => {
      if (typeof Chart !== 'undefined') {
        createPieChart(loanPercent, cpfPercent, cashableEquityPercent, valuation);
      } else {
        setTimeout(() => {
          if (typeof Chart !== 'undefined') {
            createPieChart(loanPercent, cpfPercent, cashableEquityPercent, valuation);
          }
        }, 1000);
      }
    }, 100);

    const interestRateInput = document.getElementById('interestRateInput');
    const interestRateError = document.getElementById('interestRateError');
    if (interestRateInput) {
      interestRateInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          const value = parsePercentage(this.value);
          const error = validateInterestRate(value);
          if (error && interestRateError) {
            interestRateError.textContent = error;
            interestRateError.style.display = 'block';
            labels.interestRate?.classList.add('error');
          } else if (interestRateError) {
            interestRateError.style.display = 'none';
            labels.interestRate?.classList.remove('error');
            interestRateValue = value;
            this.value = formatPercentage(value);
            calculate();
          }
        }
      });

      interestRateInput.addEventListener('blur', function() {
        const value = parsePercentage(this.value);
        const error = validateInterestRate(value);
        if (error && interestRateError) {
          interestRateError.textContent = error;
          interestRateError.style.display = 'block';
          labels.interestRate?.classList.add('error');
        } else if (interestRateError) {
          interestRateError.style.display = 'none';
          labels.interestRate?.classList.remove('error');
          interestRateValue = value;
          this.value = formatPercentage(value);
          calculate();
        }
      });
    }
  }

  ['propertyValuation', 'outstandingLoan', 'buyerAge', 'cpfUsage', 'buyerCpfUsage', 'buyerCpfOaBalance'].forEach(id => {
    if (inputs[id]) {
      inputs[id].addEventListener('input', function() {
        const rawValue = this.value.replace(/[^0-9]/g, '');
        this.value = formatNumberWithCommas(rawValue);
        calculate();
      });
    }
  });

  if (inputs.buyerShare) {
    inputs.buyerShare.addEventListener('input', function() {
      const rawValue = this.value.replace(/[^0-9]/g, '');
      const cappedValue = Math.min(parseFloat(rawValue) || 0, 99);
      this.value = formatNumberWithCommas(cappedValue.toFixed(0));
      updateSellerShare();
      calculate();
    });
  }

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

  updateSellerShare();
  calculate();

  function sendHeight() {
    const height = document.body.scrollHeight + 20;
    window.parent.postMessage({ type: 'setHeight', height: height }, '*');
  }

  const events = ['load', 'resize', 'input', 'change'];
  events.forEach(event => {
    window.addEventListener(event, sendHeight);
  });

  const observer = new MutationObserver(function() {
    setTimeout (sendHeight, 50);
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