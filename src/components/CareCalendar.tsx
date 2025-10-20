import React, { useState, useRef } from 'react';
import { ChevronDown, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

const Calendar = () => {
  const [selections, setSelections] = useState({});
  const fileInputRef = useRef(null);
  
  const names = ['', 'Bobbi', 'Kim', 'Ali', 'Jean', 'Caregiver'];
  
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  const handleSelection = (monthYear, day, period, value) => {
    const key = `${monthYear}-${day}-${period}`;
    setSelections(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const exportToExcel = () => {
    // Create data array for Excel
    const data = [];
    
    // Add headers
    data.push(['Date', 'AM Assignment', 'PM Assignment']);
    
    // Add October 2025 data
    const octDays = getDaysInMonth(2025, 9);
    for (let day = 1; day <= octDays; day++) {
      const amKey = `2025-9-${day}-AM`;
      const pmKey = `2025-9-${day}-PM`;
      data.push([
        `October ${day}, 2025`,
        selections[amKey] || '',
        selections[pmKey] || ''
      ]);
    }
    
    // Add November 2025 data
    const novDays = getDaysInMonth(2025, 10);
    for (let day = 1; day <= novDays; day++) {
      const amKey = `2025-10-${day}-AM`;
      const pmKey = `2025-10-${day}-PM`;
      data.push([
        `November ${day}, 2025`,
        selections[amKey] || '',
        selections[pmKey] || ''
      ]);
    }
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Date column
      { wch: 15 }, // AM column
      { wch: 15 }  // PM column
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Calendar Assignments');
    
    // Generate and download file
    XLSX.writeFile(wb, 'calendar_assignments.xlsx');
  };
  
  const importFromExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Parse data and update selections
        const newSelections = {};
        
        // Skip header row and process data
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row[0]) { // If date exists
            const dateStr = row[0];
            const amAssignment = row[1] || '';
            const pmAssignment = row[2] || '';
            
            // Parse date to get month and day
            let month, day;
            if (dateStr.includes('October')) {
              month = 9;
              day = parseInt(dateStr.match(/\d+/)[0]);
            } else if (dateStr.includes('November')) {
              month = 10;
              day = parseInt(dateStr.match(/\d+/)[0]);
            }
            
            if (month && day) {
              // Validate that the names are valid options
              const validNames = ['', 'Bobbi', 'Kim', 'Ali', 'Jean', 'Caregiver'];
              
              if (validNames.includes(amAssignment)) {
                newSelections[`2025-${month}-${day}-AM`] = amAssignment;
              }
              
              if (validNames.includes(pmAssignment)) {
                newSelections[`2025-${month}-${day}-PM`] = pmAssignment;
              }
            }
          }
        }
        
        setSelections(newSelections);
        alert('Calendar imported successfully!');
      } catch (error) {
        alert('Error importing file. Please make sure it\'s a valid Excel file exported from this calendar.');
        console.error('Import error:', error);
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset file input so the same file can be selected again
    event.target.value = '';
  };
  
  const renderMonth = (year, month, monthName) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthYear = `${year}-${month}`;
    
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const amKey = `${monthYear}-${day}-AM`;
      const pmKey = `${monthYear}-${day}-PM`;
      const amValue = selections[amKey] || '';
      const pmValue = selections[pmKey] || '';
      
      days.push(
        <div key={day} className="border border-gray-200 p-2 min-h-32 bg-white hover:bg-gray-50 transition-colors">
          <div className="font-semibold text-sm text-gray-700 mb-2">{day}</div>
          
          {/* AM Dropdown */}
          <div className="mb-2">
            <label className="text-xs text-gray-600 font-medium">AM:</label>
            <div className="relative">
              <select
                value={amValue}
                onChange={(e) => handleSelection(monthYear, day, 'AM', e.target.value)}
                className={`w-full px-2 py-1 text-sm border rounded cursor-pointer focus:outline-none focus:ring-2 appearance-none hover:border-gray-400 ${
                  amValue === 'Caregiver' 
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 text-red-700' 
                    : 'border-gray-300 bg-white focus:ring-blue-500'
                }`}
                style={{ paddingRight: '24px' }}
              >
                <option value="">Select...</option>
                {names.slice(1).map(name => (
                  <option key={name} value={name} className={name === 'Caregiver' ? 'text-red-600' : ''}>{name}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none ${
                amValue === 'Caregiver' ? 'text-red-400' : 'text-gray-400'
              }`} />
            </div>
          </div>
          
          {/* PM Dropdown */}
          <div>
            <label className="text-xs text-gray-600 font-medium">PM:</label>
            <div className="relative">
              <select
                value={pmValue}
                onChange={(e) => handleSelection(monthYear, day, 'PM', e.target.value)}
                className={`w-full px-2 py-1 text-sm border rounded cursor-pointer focus:outline-none focus:ring-2 appearance-none hover:border-gray-400 ${
                  pmValue === 'Caregiver' 
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 text-red-700' 
                    : 'border-gray-300 bg-white focus:ring-blue-500'
                }`}
                style={{ paddingRight: '24px' }}
              >
                <option value="">Select...</option>
                {names.slice(1).map(name => (
                  <option key={name} value={name} className={name === 'Caregiver' ? 'text-red-600' : ''}>{name}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none ${
                pmValue === 'Caregiver' ? 'text-red-400' : 'text-gray-400'
              }`} />
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{monthName} {year}</h2>
        <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-300">
          {weekDays.map(day => (
            <div key={day} className="font-bold text-center py-2 bg-gray-100 border-r border-b border-gray-300 text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0 border-l border-gray-300">
          {days.map((day, index) => (
            <div key={index} className="border-r border-b border-gray-300">
              {day}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const getSummary = () => {
    const summary = { 
      Bobbi: { AM: [], PM: [] }, 
      Kim: { AM: [], PM: [] }, 
      Ali: { AM: [], PM: [] }, 
      Jean: { AM: [], PM: [] },
      Caregiver: { AM: [], PM: [] }
    };
    
    Object.entries(selections).forEach(([key, name]) => {
      if (name) {
        const parts = key.split('-');
        const month = parseInt(parts[1]) === 9 ? 'Oct' : 'Nov';
        const day = parts[2];
        const period = parts[3];
        summary[name][period].push(`${month} ${day}`);
      }
    });
    
    return summary;
  };
  
  const summary = getSummary();
  
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">
        Assignment Calendar - October & November 2025
      </h1>
      
      {/* Export/Import Controls */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Import from Excel
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={importFromExcel}
          className="hidden"
        />
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {renderMonth(2025, 9, 'October')}
        {renderMonth(2025, 10, 'November')}
      </div>
      
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Summary</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(summary).map(([name, periods]) => (
            <div key={name} className={`p-4 rounded-lg ${
              name === 'Caregiver' ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'
            }`}>
              <h4 className={`font-semibold text-lg mb-3 ${
                name === 'Caregiver' ? 'text-red-600' : 'text-blue-600'
              }`}>{name}</h4>
              
              <div className="mb-2">
                <h5 className="text-sm font-medium text-gray-700">AM Shifts:</h5>
                <p className="text-xs text-gray-600">
                  {periods.AM.length > 0 ? periods.AM.join(', ') : 'None'}
                </p>
                <p className="text-xs text-gray-500">Total: {periods.AM.length}</p>
              </div>
              
              <div className="mb-2">
                <h5 className="text-sm font-medium text-gray-700">PM Shifts:</h5>
                <p className="text-xs text-gray-600">
                  {periods.PM.length > 0 ? periods.PM.join(', ') : 'None'}
                </p>
                <p className="text-xs text-gray-500">Total: {periods.PM.length}</p>
              </div>
              
              <div className="pt-2 border-t border-gray-300">
                <p className={`text-sm font-medium ${
                  name === 'Caregiver' ? 'text-red-700' : 'text-gray-700'
                }`}>
                  Total shifts: {periods.AM.length + periods.PM.length}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;