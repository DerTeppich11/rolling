import React, { useState, useEffect } from 'react';

const DiceGame = () => {
    const [dice, setDice] = useState([1, 1, 1, 1, 1, 1]);
    const [heldDice, setHeldDice] = useState([false, false, false, false, false, false]);
    const [lockedDice, setLockedDice] = useState([false, false, false, false, false, false]);
    const [numberOfTurns, setNumberOfTurns] = useState(0);
    const [isRolling, setIsRolling] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bValidHold, setValid] = useState(true);
    const [roundScore, setRoundScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [gameOver, setIsGameOver] = useState(false);

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
                setDice(data.dice || [0, 0, 0, 0, 0, 0]);
                setHeldDice(data.held || [false, false, false, false, false, false]);
            } catch (err) {
                console.error("Error fetching initial state:", err);
                setError(err.message);
                // Fall back to default values
                setDice([0, 0, 0, 0, 0, 0]);
                setHeldDice([false, false, false, false, false, false]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialState();
    }, []);

    const toggleHold = async (index) => {
        try {
            if(!lockedDice[index] && dice[1] !== 0) {
                const response = await fetch(`http://localhost:8080/api/hold/${index}`, {
                    method: 'POST'
                });
                setValid(await response.json());
                const newHeld = [...heldDice];
                newHeld[index] = !newHeld[index];
                setHeldDice(newHeld);
            }
        } catch (error) {
            console.error("Error toggling hold:", error);
        }
    };

    const rollDice = async () => {
        setIsRolling(true);
        try {

            if (heldDice.length > 0) {
                const response = await fetch('http://localhost:8080/api/lock-dice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(heldDice)
                });
                const newLockedDice = await response.json();
                var diceToLock = lockedDice;
                for(var i = 0; i < newLockedDice.length; i++) {
                    if(newLockedDice[i]) {
                        diceToLock[i] = newLockedDice[i]
                    }
                }
                setLockedDice(diceToLock);
                setHeldDice([false, false, false, false, false, false]);

                if(bValidHold) {
                    const responseScore = await fetch(`http://localhost:8080/api/score/${roundScore}`, {
                        method: 'POST'
                    });
                    setRoundScore(await responseScore.json());
                }
            }

            const indicesToRoll = dice.map((_, i) => i).filter(i => !heldDice[i] && !lockedDice[i]);
            const response = await fetch('http://localhost:8080/api/roll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(indicesToRoll)
            });
            const newDice = await response.json();
            setDice(newDice);
            setNumberOfTurns(prev => prev + 1);
            const newRolls = newDice.filter((_, i) => !lockedDice[i]);
            const responseGameOver = await fetch(`http://localhost:8080/api/checkGameOver`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRolls)
            });
            setIsGameOver(await responseGameOver.json());
            if(gameOver) {
                resetGame();
            }
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
            setDice([0, 0, 0, 0, 0, 0]);
            setHeldDice([false, false, false, false, false, false]);
            setLockedDice([false, false, false, false, false, false]);
            setNumberOfTurns(0);
            setRoundScore(0);
        } catch (error) {
            console.error("Error resetting game:", error);
        }
    };

    const endRound = async () => {
        try {
            await fetch('http://localhost:8080/api/reset', {
                method: 'POST'
            });

            if(bValidHold) {
                const responseScore = await fetch(`http://localhost:8080/api/score/${roundScore}`, {
                    method: 'POST'
                });
                setRoundScore(await responseScore.json());
            }

            setDice([0, 0, 0, 0, 0, 0]);
            setHeldDice([false, false, false, false, false, false]);
            setLockedDice([false, false, false, false, false, false]);
            setNumberOfTurns(0);
            setTotalScore(roundScore)
            setRoundScore(0);
        } catch (error) {
            console.error("Error resetting game:", error);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = () => {
          resetGame(); // Reset game when page refreshes
        };
      
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      }, []);

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
                            backgroundColor: lockedDice[index] ? '#2E7D32' : heldDice[index] ? '#4CAF50' : '#fff',
                            border: `2px solid ${heldDice[index] ? '#2E7D32' : '#333'}`,
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '24px',
                            cursor: lockedDice[index] ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            transform: heldDice[index] && !lockedDice[index] ? 'scale(1.1)' : 'scale(1)'
                        }}
                    >
                        {value}
                    </div>
                ))}
            </div>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button 
                    onClick={rollDice} 
                    disabled={isRolling || !bValidHold}
                    style={{
                        padding: '10px 20px',
                        fontSize: '18px',
                        backgroundColor: (isRolling || !bValidHold) ? '#cccccc' : '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: (isRolling || !bValidHold) ? 'not-allowed' : 'pointer'
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

                <button 
                    onClick={endRound}
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
                    End Round
                </button>
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <p>Click dice to hold/unhold them</p>
                <p>Held dice won't be rolled again</p>
                <p>Turn: {numberOfTurns}</p>
                <p>Round Score: {roundScore}</p>
                <p>Total Score: {totalScore}</p>
                <p>GameOver: {gameOver.toString()}</p>
            </div>
        </div>
    );
};

export default DiceGame;