
    let logoData = '';

    document.getElementById('logoUpload').addEventListener('change', function (e) {
      const reader = new FileReader();
      reader.onload = function (event) {
        logoData = event.target.result;
        document.getElementById('logoPreview').src = logoData;
      };
      reader.readAsDataURL(e.target.files[0]);
    });

    function generateTable() {
      const columns = document.getElementById('columnsInput').value.split(',').map(c => c.trim());
      const dataLines = document.getElementById('dataInput').value.trim().split('\n');
      const title = document.getElementById('headerTitle').value;
      const description = document.getElementById('headerDesc').value;
      const footer = document.getElementById('footerText').value;
      const tableContainer = document.getElementById('tableContainer');

      let html = '<div id="printContent">';
      if (title) html += `<h3>${title}</h3>`;
      if (description) html += `<p style="text-align:center;">${description}</p>`;
      if (logoData) html += `<img src="${logoData}" style="max-height: 100px; display:block; margin:auto;" />`;

      html += '<table><thead><tr>';
      columns.forEach(col => html += `<th>${col}</th>`);
      html += '</tr></thead><tbody>';

      dataLines.forEach(line => {
        const parts = line.trim().split(',');
        html += '<tr>';
        for (let i = 0; i < columns.length; i++) {
          html += `<td contenteditable="true">${parts[i] || ''}</td>`;
        }
        html += '</tr>';
      });

      html += '</tbody></table>';
      if (footer) html += `<div class="footer">${footer}</div>`;
      html += '</div>';

      tableContainer.innerHTML = html;
    }

    function saveAsJSON() {
      const data = {
        columns: document.getElementById('columnsInput').value,
        data: document.getElementById('dataInput').value,
        headerTitle: document.getElementById('headerTitle').value,
        headerDesc: document.getElementById('headerDesc').value,
        footerText: document.getElementById('footerText').value,
        logoData: logoData
      };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'table-data.json';
      link.click();
    }

    function loadFromJSON(input) {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = JSON.parse(e.target.result);
        document.getElementById('columnsInput').value = content.columns;
        document.getElementById('dataInput').value = content.data;
        document.getElementById('headerTitle').value = content.headerTitle;
        document.getElementById('headerDesc').value = content.headerDesc;
        document.getElementById('footerText').value = content.footerText;
        logoData = content.logoData;
        document.getElementById('logoPreview').src = logoData;
        generateTable();
      };
      reader.readAsText(file);
    }

    async function downloadPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const element = document.getElementById('printContent');
      await html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        doc.save("tableau.pdf");
      });
    }

    function downloadWord() {
      const content = document.getElementById('printContent').innerHTML;
      const blob = new Blob(['<html><head><meta charset="UTF-8"></head><body>' + content + '</body></html>'], {
        type: 'application/msword'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'tableau.doc';
      link.click();
    }

    function changeTheme(theme) {
      const root = document.documentElement;
      const themes = {
        rose: {
          '--main-color': '#ec407a',
          '--main-dark': '#d81b60',
          '--background-color': '#fff0f5',
          '--table-header': '#f06292',
          '--table-row-alt': '#ffe3ef',
          '--border-color': '#f8bbd0'
        },
        blue: {
          '--main-color': '#42a5f5',
          '--main-dark': '#1e88e5',
          '--background-color': '#e3f2fd',
          '--table-header': '#64b5f6',
          '--table-row-alt': '#bbdefb',
          '--border-color': '#90caf9'
        },
        purple: {
          '--main-color': '#ab47bc',
          '--main-dark': '#8e24aa',
          '--background-color': '#f3e5f5',
          '--table-header': '#ce93d8',
          '--table-row-alt': '#e1bee7',
          '--border-color': '#ba68c8'
        },
        green: {
          '--main-color': '#66bb6a',
          '--main-dark': '#43a047',
          '--background-color': '#e8f5e9',
          '--table-header': '#81c784',
          '--table-row-alt': '#c8e6c9',
          '--border-color': '#a5d6a7'
        }
      };
      const selected = themes[theme];
      for (let key in selected) {
        root.style.setProperty(key, selected[key]);
      }
    }
  