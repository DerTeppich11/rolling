import React, { useEffect, useState } from 'react';
import { Button, Container} from 'reactstrap';
import AppNavbar from './AppNavbar';
import { Link } from 'react-router-dom';

const Options = () => {
  // Load saved preferences or use defaults
  const loadPreferences = () => {
    const savedPrefs = localStorage.getItem('gameOptions');
    return savedPrefs 
      ? JSON.parse(savedPrefs)
      : { playerCount: 2, font: 'Arial' };
  };

  const resetToDefaults = () => {
    setOptions({ playerCount: 2, font: 'Arial' });
  };

  // Initialize state with saved preferences
  const [options, setOptions] = useState(loadPreferences);
  
  // Available font options
  const fontOptions = [
    'Arial',
    'Verdana',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Comic Sans MS'
  ];

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('gameOptions', JSON.stringify(options));
  }, [options]);

  const handlePlayerCountChange = (e) => {
    const count = parseInt(e.target.value);
    if (!isNaN(count) && count > 0) {
      setOptions(prev => ({ ...prev, playerCount: count }));
    }
  };

  const handleFontChange = (e) => {
    setOptions(prev => ({ ...prev, font: e.target.value }));
  };

  return (
    <div style={{ fontFamily: options.font}}>
    <AppNavbar/>
    <Container fluid>
   
      <h2>Game Options</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Number of Players:
          <input 
            type="number" 
            min="1" 
            value={options.playerCount} 
            onChange={handlePlayerCountChange}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Select Font:
          <select 
            value={options.font} 
            onChange={handleFontChange}
            style={{ marginLeft: '10px', fontFamily: options.font }}
          >
            {fontOptions.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </label>
      </div>
      
      <div>
        <h3>Current Settings:</h3>
        <p>Players: {options.playerCount}</p>
        <p>Font: {options.font}</p>
        <p style={{ fontFamily: options.font }}>
          This text shows how the selected font looks.
        </p>
        <Button onClick={resetToDefaults}>Reset to Default</Button>
      </div>
      </Container>
    </div>
    
  );
};

export default Options;