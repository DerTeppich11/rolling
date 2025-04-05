import React, { useState, useEffect } from 'react';

const DiceGame = () => {
    const [dice, setDice] = useState([1, 1, 1, 1, 1, 1]);
    const [heldDice, setHeldDice] = useState([false, false, false, false, false, false]);
    const [isRolling, setIsRolling] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch initial state with error handling
    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/dice');
                if (!response.ok) {
                    throw new Error('Failed to fetch dice');
                }
                const data = await response.json();
                
                // Ensure we have valid data
                setDice(data.dice || [1, 1, 1, 1, 1, 1]);
                setHeldDice(data.held || [false, false, false, false, false, false]);
            } catch (err) {
                console.error("Error fetching initial state:", err);
                setError(err.message);
                // Fall back to default values
                setDice([1, 1, 1, 1, 1, 1]);
                setHeldDice([false, false, false, false, false, false]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialState();
    }, []);

    const toggleHold = async (index) => {
        try {
            await fetch(`http://localhost:8080/api/hold/${index}`, {
                method: 'POST'
            });
            const newHeld = [...heldDice];
            newHeld[index] = !newHeld[index];
            setHeldDice(newHeld);
        } catch (error) {
            console.error("Error toggling hold:", error);
        }
    };

    const rollDice = async () => {
        setIsRolling(true);
        try {
            const indicesToRoll = dice.map((_, i) => i).filter(i => !heldDice[i]);
            const response = await fetch('http://localhost:8080/api/roll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(indicesToRoll)
            });
            const newDice = await response.json();
            setDice(newDice);
        } catch (error) {
            console.error("Error rolling dice:", error);
        } finally {
            setIsRolling(false);
        }
    };

    const resetGame = async () => {
        try {
            await fetch('http://localhost:8080/api/reset', {
                method: 'POST'
            });
            setDice([1, 1, 1, 1, 1, 1]);
            setHeldDice([false, false, false, false, false, false]);
        } catch (error) {
            console.error("Error resetting game:", error);
        }
    };

    if (isLoading) {
        return <div>Loading game...</div>;
    }

    if (error) {
        return <div>Error: {error}. Using default values.</div>;
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Dice Game</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '30px' }}>
                {dice.map((value, index) => (
                    <div 
                        key={index}
                        onClick={() => toggleHold(index)}
                        style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: heldDice[index] ? '#4CAF50' : '#fff',
                            border: `2px solid ${heldDice[index] ? '#2E7D32' : '#333'}`,
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            transform: heldDice[index] ? 'scale(1.1)' : 'scale(1)'
                        }}
                    >
                        {value}
                    </div>
                ))}
            </div>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button 
                    onClick={rollDice} 
                    disabled={isRolling}
                    style={{
                        padding: '10px 20px',
                        fontSize: '18px',
                        backgroundColor: (isRolling) ? '#cccccc' : '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: (isRolling) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isRolling ? 'Rolling...' : 'Roll Dice'}
                </button>
                
                <button 
                    onClick={resetGame}
                    style={{
                        padding: '10px 20px',
                        fontSize: '18px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Reset Game
                </button>
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <p>Click dice to hold/unhold them</p>
                <p>Held dice won't be rolled again</p>
            </div>
        </div>
    );
};

export default DiceGame;