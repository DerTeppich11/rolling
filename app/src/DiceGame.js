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
    const [tmpScore, setTmpScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    var isGameOver;

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
            const newHeld = [...heldDice];
            newHeld[index] = !newHeld[index];
            const heldDices = dice.filter((_, i) => newHeld[i]);
            if(!lockedDice[index] && dice[1] !== 0) {
                if(heldDices.length > 0) {
                const response = await fetch(`http://localhost:8080/api/hold`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(heldDices)
                });
                const bValid = await response.json();
                setValid(bValid);
                setHeldDice(newHeld);
                if(bValid) {
                const heldRoll = dice.filter((_, i) => newHeld[i] && !lockedDice[i]);
                const responseScore = await fetch(`http://localhost:8080/api/score/${tmpScore}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(heldRoll)
                });
                setTmpScore(await responseScore.json())
            }
            } else {
                setTmpScore(0);
                setHeldDice(heldDices);
            }

            }
        } catch (error) {
            console.error("Error toggling hold:", error);
        }
    };

    const rollDice = async () => {
        setIsRolling(true);
        try {
            if (heldDice.includes(true)) {
                const response = await fetch('http://localhost:8080/api/lock-dice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(heldDice)
                });
                const newLockedDice = await response.json();
                var diceToLock = [...lockedDice];
                for(var i = 0; i < newLockedDice.length; i++) {
                    if(newLockedDice[i]) {
                        diceToLock[i] = newLockedDice[i]
                    }
                }
                setLockedDice(diceToLock);
                const iLockedDices = diceToLock.filter(val => val === true).length;
                // alle 6 Wuerfel erfolgreich
                if(iLockedDices === 6) {
                    setLockedDice([false, false, false, false, false, false]);
                    setHeldDice([false, false, false, false, false, false]);
                    setDice([0,0,0,0,0,0]);
                }
                setHeldDice([false, false, false, false, false, false]);
                setRoundScore(prev => prev + tmpScore);
                setTmpScore(0);
            }
            var indicesToRoll;
            if(isOpen) {
                setIsOpen(false);
                setLockedDice([false, false, false, false, false, false]);
                setHeldDice([false, false, false, false, false, false]);
                indicesToRoll = ([0,1,2,3,4,5]);
            } else {
                indicesToRoll = dice.map((_, i) => i).filter(i => !heldDice[i] && !lockedDice[i]);
            }
            if(!heldDice.includes(false)) {
                indicesToRoll = ([0,1,2,3,4,5]);
            }
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
            var newRolls;
            if(diceToLock) {
                newRolls = newDice.filter((_, i) => !diceToLock[i]);
            } else {
                newRolls = newDice;
            }
            
            const responseGameOver = await fetch(`http://localhost:8080/api/checkGameOver`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRolls)
            });
            isGameOver = await responseGameOver.json();
            if(isGameOver) {
                gameOverM();
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
            setIsOpen(false);
        } catch (error) {
            console.error("Error resetting game:", error);
        }
    };

    const endRound = async () => {
        try {
            /* await fetch('http://localhost:8080/api/reset', {
                method: 'POST'
            }); */

            /* if(bValidHold) {
                const responseScore = await fetch(`http://localhost:8080/api/score/${roundScore}`, {
                    method: 'POST'
                });
                setRoundScore(await responseScore.json());
            } */

            if(isGameOver) {
                setIsOpen(true);
            }

            setDice([0, 0, 0, 0, 0, 0]);
            setHeldDice([false, false, false, false, false, false]);
            setLockedDice([false, false, false, false, false, false]);
            setNumberOfTurns(0);
            setTotalScore(prev => prev + roundScore + tmpScore)
            setRoundScore(0);
            setTmpScore(0);
        } catch (error) {
            console.error("Error resetting game:", error);
        }
    };

    const gameOverM = async () => {
        try {
            /* await fetch('http://localhost:8080/api/reset', {
                method: 'POST'
            }); */

            /* if(bValidHold) {
                const responseScore = await fetch(`http://localhost:8080/api/score/${roundScore}`, {
                    method: 'POST'
                });
                setRoundScore(await responseScore.json());
            } */

          /*   if(isGameOver) {
                setIsOpen(true);
            } */

            /* setDice([0, 0, 0, 0, 0, 0]); */
            /* setHeldDice([false, false, false, false, false, false]);
            setLockedDice([false, false, false, false, false, false]); */
            setNumberOfTurns(0);
            setIsOpen(true);
            /* setTotalScore(prev => prev + roundScore) */
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
                    disabled={tmpScore + roundScore < 350}
                    style={{
                        padding: '10px 20px',
                        fontSize: '18px',
                        backgroundColor: tmpScore + roundScore < 350 ?  '#cccccc' : '#f44336',
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
                <p>Tmp Score: {tmpScore}</p>
                <p>Round Score: {roundScore}</p>
                <p>Total Score: {totalScore}</p>
            </div>
            <dialog open={isOpen} style={{ padding: '20px', borderRadius: '8px' }}>
            <h2>GAME OVER!</h2>
            </dialog>
        </div>
    );
};

export default DiceGame;