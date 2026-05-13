document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const toggleButtons = document.querySelectorAll('[aria-label="Toggle menu"]');
    const mobileMenus = document.querySelectorAll('.fixed.inset-0.z-40.bg-\\[\\#E86A10\\]');

    toggleButtons.forEach((btn, index) => {
        const menu = mobileMenus[index];
        if (menu) {
            btn.addEventListener('click', () => {
                const isOpen = !menu.classList.contains('opacity-0');
                if (isOpen) {
                    menu.classList.add('opacity-0', 'pointer-events-none');
                } else {
                    menu.classList.remove('opacity-0', 'pointer-events-none');
                }
            });

            // Close menu when clicking a link inside it
            const links = menu.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.add('opacity-0', 'pointer-events-none');
                });
            });
        }
    });

    // HubSpot Form Initialization
    const initHubSpotForms = () => {
        const wrappers = document.querySelectorAll('.hubspot-form-wrapper');
        if (wrappers.length > 0) {
            const script = document.createElement('script');
            script.src = 'https://js.hsforms.net/forms/v2.js';
            script.async = true;
            script.onload = () => {
                wrappers.forEach(wrapper => {
                    // Get form configuration from the static scraped iframe if possible
                    const iframeDiv = wrapper.querySelector('.hs-form-frame');
                    let formId = '86ba9841-d3e5-4a2a-8a3a-a01585ccfa4e'; // default
                    if (iframeDiv && iframeDiv.dataset.formId) {
                        formId = iframeDiv.dataset.formId;
                    }
                    
                    // Clear the container
                    wrapper.innerHTML = '';
                    
                    if (window.hbspt) {
                        window.hbspt.forms.create({
                            region: 'na1',
                            portalId: '49312225',
                            formId: formId,
                            target: '#' + wrapper.id
                        });
                    }
                });
            };
            document.body.appendChild(script);
        }
    };
    initHubSpotForms();

    // 2. Scoreboard Animations (Mundial pages)
    // Since the HTML was scraped with scores at 0, we can add a small script to animate them
    // back to their intended values based on context, or just leave them as static.
    // For a generic lean approach, let's fix the specific scoreboard on Mundial:
    const scoreboards = document.querySelectorAll('.scoreboard-container');
    scoreboards.forEach(sb => {
        const teams = sb.querySelectorAll('.scoreboard-team');
        if (teams.length === 2) {
            const leftName = teams[0].querySelector('.scoreboard-team-name')?.textContent;
            const rightName = teams[1].querySelector('.scoreboard-team-name')?.textContent;
            const leftScoreEl = teams[0].querySelector('.scoreboard-score');
            const rightScoreEl = teams[1].querySelector('.scoreboard-score');

            let leftTarget = 0;
            let rightTarget = 0;

            if (leftName === 'Estrategia' && rightName === 'Excusas') {
                leftTarget = 3;
                rightTarget = 0;
            } else if (leftName === 'Dinero parado' && rightName === 'Dinero invertido') {
                leftTarget = 1;
                rightTarget = 4;
            } else if (leftName === 'Excusas' && rightName === 'Decisiones') {
                leftTarget = 0;
                rightTarget = 1;
            }

            if (leftTarget > 0 || rightTarget > 0) {
                // Intersection Observer to trigger animation
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            animateValue(leftScoreEl, 0, leftTarget, 1000);
                            animateValue(rightScoreEl, 0, rightTarget, 1000);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(sb);
            }
        }
    });

    // 3. Simulator Logic (Mundial pages)
    const simuladorSection = document.getElementById('simulador');
    if (simuladorSection) {
        const simCard = simuladorSection.querySelector('.quiz-card');
        if (simCard) {
            const inputs = simCard.querySelectorAll('.sim-input');
            if (inputs.length >= 2) {
                const amountInput = inputs[0];
                const monthlyInput = inputs[1];

                const buttonGroups = simCard.querySelectorAll('.flex.gap-3');
                if (buttonGroups.length >= 2) {
                    const yearButtons = buttonGroups[0].querySelectorAll('button');
                    const strategyButtons = buttonGroups[1].querySelectorAll('button');

                    let selectedYears = 3;
                    let selectedStrategy = 'balanceada';

                    // Year buttons logic
                    yearButtons.forEach(btn => {
                        btn.addEventListener('click', () => {
                            yearButtons.forEach(b => {
                                b.className = 'flex-1 py-3 rounded-xl font-bold text-lg transition-all bg-white/10 text-white/70 hover:bg-white/20';
                            });
                            btn.className = 'flex-1 py-3 rounded-xl font-bold text-lg transition-all bg-[#E86A10] text-white shadow-lg';
                            selectedYears = parseInt(btn.textContent);
                        });
                    });

                    // Strategy buttons logic
                    strategyButtons.forEach(btn => {
                        btn.addEventListener('click', () => {
                            strategyButtons.forEach(b => {
                                b.className = 'flex-1 py-3 rounded-xl font-bold text-sm md:text-base capitalize transition-all bg-white/10 text-white/70 hover:bg-white/20';
                            });
                            btn.className = 'flex-1 py-3 rounded-xl font-bold text-sm md:text-base capitalize transition-all bg-[#E86A10] text-white shadow-lg';
                            selectedStrategy = btn.textContent.trim().toLowerCase();
                        });
                    });

                    // Input formatting
                    [amountInput, monthlyInput].forEach(input => {
                        input.addEventListener('input', (e) => {
                            let val = e.target.value.replace(/[^0-9]/g, '');
                            if (val) {
                                e.target.value = parseInt(val, 10).toLocaleString('en-US');
                            }
                        });
                    });

                    // Submit button
                    const submitBtn = simCard.querySelector('.cta-pill');
                    if (submitBtn) {
                        submitBtn.addEventListener('click', () => {
                            const initialAmount = parseFloat(amountInput.value.replace(/,/g, '')) || 0;
                            const monthlyAmount = parseFloat(monthlyInput.value.replace(/,/g, '')) || 0;
                            
                            const rates = { conservadora: 0.05, balanceada: 0.07, crecimiento: 0.09 };
                            const rate = rates[selectedStrategy] || 0.07;
                            
                            const months = selectedYears * 12;
                            const monthlyRate = rate / 12;
                            let futureValue = initialAmount * Math.pow(1 + monthlyRate, months);
                            for (let i = 0; i < months; i++) {
                                futureValue += monthlyAmount * Math.pow(1 + monthlyRate, months - i - 1);
                            }
                            
                            const parkedValue = initialAmount + (monthlyAmount * months);
                            
                            const formatCurrency = (n) => '$' + Math.round(n).toLocaleString('es-MX');

                            // Build the result HTML
                            const resultHTML = `
                                <div class="max-w-2xl mx-auto space-y-10 animate-fade-in" style="animation: fadeIn 0.6s ease-out forwards;">
                                    <div class="scoreboard-container mx-auto">
                                        <div class="scoreboard-inner">
                                            <div class="scoreboard-top">
                                                <div class="scoreboard-led"></div>
                                                <span class="scoreboard-label">El marcador de tu dinero</span>
                                                <div class="scoreboard-led"></div>
                                            </div>
                                            <div class="scoreboard-teams">
                                                <div class="scoreboard-team">
                                                    <span class="scoreboard-team-name">Dinero parado</span>
                                                    <span class="scoreboard-score">0</span>
                                                </div>
                                                <span class="scoreboard-divider">—</span>
                                                <div class="scoreboard-team">
                                                    <span class="scoreboard-team-name">Dinero invertido</span>
                                                    <span class="scoreboard-score">0</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p class="text-center text-xl md:text-2xl font-medium opacity-90">
                                        Cuando tu dinero entra al juego, el marcador cambia.
                                    </p>
                                    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-white/10">
                                        <p class="text-lg font-medium opacity-80 text-center mb-4">Tu dinero podría pasar de</p>
                                        <div class="flex items-center justify-center gap-6 mb-6">
                                            <div class="text-center">
                                                <p class="text-sm font-bold uppercase tracking-widest opacity-60">Hoy</p>
                                                <p class="font-extrabold text-3xl md:text-4xl">${formatCurrency(initialAmount)}</p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-8 h-8 opacity-60"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                            <div class="text-center">
                                                <p class="text-sm font-bold uppercase tracking-widest opacity-60">En ${selectedYears} años</p>
                                                <p class="font-extrabold text-3xl md:text-4xl text-[#FFD700]">${formatCurrency(futureValue)}</p>
                                            </div>
                                        </div>
                                        <div class="mt-6 flex flex-col border border-white/10 rounded-xl overflow-hidden text-sm md:text-base">
                                            <div class="flex justify-between bg-white/5 p-4 border-b border-white/10 font-bold opacity-80">
                                                <span>Estrategia</span>
                                                <span>Resultado</span>
                                            </div>
                                            <div class="flex justify-between p-4 border-b border-white/10">
                                                <span>Dinero parado</span>
                                                <span class="font-bold">${formatCurrency(parkedValue)}</span>
                                            </div>
                                            <div class="flex justify-between p-4 bg-white/5">
                                                <span>FÓNDIKA</span>
                                                <span class="font-extrabold text-[#E86A10]">${formatCurrency(futureValue)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex justify-center mt-10">
                                        <button class="cta-pill restart-sim">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw w-5 h-5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                            Volver a calcular
                                        </button>
                                    </div>
                                </div>
                            `;

                            // Hide quiz card and show result
                            simCard.style.display = 'none';
                            
                            // Insert result next to it
                            const resultContainer = document.createElement('div');
                            resultContainer.className = 'sim-result-container w-full';
                            resultContainer.innerHTML = resultHTML;
                            
                            simCard.parentNode.appendChild(resultContainer);
                            
                            // Animate scoreboard elements
                            const leftScoreEl = resultContainer.querySelector('.scoreboard-team:first-child .scoreboard-score');
                            const rightScoreEl = resultContainer.querySelector('.scoreboard-team:last-child .scoreboard-score');
                            if (leftScoreEl && rightScoreEl) {
                                animateValue(leftScoreEl, 0, 1, 1000);
                                animateValue(rightScoreEl, 0, 4, 1000);
                            }

                            // Add restart logic
                            resultContainer.querySelector('.restart-sim').addEventListener('click', () => {
                                resultContainer.remove();
                                simCard.style.display = 'block';
                            });
                        });
                    }
                }
            }
        }
    }

    function animateValue(obj, start, end, duration) {
        if (!obj || end === 0) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
            }
        };
        window.requestAnimationFrame(step);
    }

    // 3. Quiz / Score Calculator Logic
    const quizSection = document.getElementById('quiz');
    if (quizSection) {
        const quizQuestions = [
            {
                question: "Cuando recibes dinero extra, normalmente:",
                options: [
                    { text: "Ya tengo un plan para invertirlo", points: 3 },
                    { text: "Busco dónde invertirlo", points: 2 },
                    { text: "Lo ahorro", points: 1 },
                    { text: "Lo dejo en mi cuenta", points: 0 }
                ]
            },
            {
                question: "¿Tienes un objetivo claro para tus ahorros?",
                options: [
                    { text: "Sí, con plazos y montos definidos", points: 3 },
                    { text: "Sí, pero es general", points: 2 },
                    { text: "Solo quiero tener algo ahorrado", points: 1 },
                    { text: "No he pensado en eso", points: 0 }
                ]
            },
            {
                question: "Si hay volatilidad en los mercados, tú:",
                options: [
                    { text: "Mantengo mi estrategia a largo plazo", points: 3 },
                    { text: "Reviso mis opciones con mi asesor", points: 2 },
                    { text: "Me preocupo un poco", points: 1 },
                    { text: "Retiro mi dinero inmediatamente", points: 0 }
                ]
            },
            {
                question: "¿Conoces tu perfil de inversionista?",
                options: [
                    { text: "Sí, y mi portafolio lo refleja", points: 3 },
                    { text: "Tengo una idea básica", points: 2 },
                    { text: "No, pero me gustaría saberlo", points: 1 },
                    { text: "¿Qué es un perfil de inversionista?", points: 0 }
                ]
            },
            {
                question: "Al hablar de diversificación, tú:",
                options: [
                    { text: "Tengo mi dinero en diferentes activos", points: 3 },
                    { text: "Trato de no tener todo en un mismo lugar", points: 2 },
                    { text: "Todo lo tengo en el banco", points: 1 },
                    { text: "Prefiero el efectivo", points: 0 }
                ]
            },
            {
                question: "¿Qué haces para proteger tu dinero de la inflación?",
                options: [
                    { text: "Invierto en instrumentos que la superen", points: 3 },
                    { text: "Busco opciones de rendimiento básico", points: 2 },
                    { text: "Ahorro más para compensar", points: 1 },
                    { text: "Nada en particular", points: 0 }
                ]
            }
        ];

        let currentQuestionIndex = 0;
        let totalScore = 0;

        const questionTextEl = quizSection.querySelector('h4');
        const progressTextEl = quizSection.querySelector('p.text-sm.font-bold');
        const progressBarEl = quizSection.querySelector('.h-full.bg-white.rounded-full');
        const optionsContainer = quizSection.querySelector('.flex.flex-col.gap-3');
        const quizCard = quizSection.querySelector('.quiz-card');

        // Letters for options
        const letters = ['A', 'B', 'C', 'D'];

        // Add CSS for fade in if it doesn't exist
        if (!document.getElementById('quiz-fade-style')) {
            const style = document.createElement('style');
            style.id = 'quiz-fade-style';
            style.textContent = `
                @keyframes quizFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .quiz-animate {
                    animation: quizFadeIn 0.4s ease-out forwards;
                }
            `;
            document.head.appendChild(style);
        }

        const renderQuestion = () => {
            const q = quizQuestions[currentQuestionIndex];
            
            // Remove animation class to restart it
            quizCard.classList.remove('quiz-animate');
            // Trigger reflow
            void quizCard.offsetWidth;
            quizCard.classList.add('quiz-animate');

            // Update Question Text
            if (questionTextEl) questionTextEl.textContent = q.question;
            
            // Update Progress
            if (progressTextEl) progressTextEl.textContent = `Pregunta ${currentQuestionIndex + 1} de ${quizQuestions.length}`;
            if (progressBarEl) {
                const progressPercent = ((currentQuestionIndex) / quizQuestions.length) * 100;
                progressBarEl.style.width = `${progressPercent}%`;
            }

            // Update Options
            if (optionsContainer) {
                optionsContainer.innerHTML = '';
                q.options.forEach((opt, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'quiz-option text-left p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-4 w-full';
                    btn.innerHTML = `<span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">${letters[idx]}</span><span class="flex-1">${opt.text}</span>`;
                    
                    btn.addEventListener('click', () => {
                        handleOptionSelect(opt);
                    });
                    
                    optionsContainer.appendChild(btn);
                });
            }
        };

        const handleOptionSelect = (option) => {
            totalScore += option.points;
            currentQuestionIndex++;

            if (currentQuestionIndex < quizQuestions.length) {
                renderQuestion();
            } else {
                showResults();
            }
        };

        const showResults = () => {
            if (progressBarEl) progressBarEl.style.width = '100%';
            
            quizCard.classList.remove('quiz-animate');
            void quizCard.offsetWidth;
            quizCard.classList.add('quiz-animate');

            let groupData = { letter: '', title: '', result: '', desc: '', quote: '', color: '' };
            
            if (totalScore >= 14) {
                groupData = {
                    letter: 'A',
                    title: 'Constructor de Patrimonio',
                    result: 'Final',
                    desc: 'Tu dinero ya está jugando para ganar el campeonato. Lo importante ahora es mantener visión, estrategia y consistencia.',
                    quote: '"El patrimonio se construye con visión."',
                    color: 'bg-[#E86A10] text-white'
                };
            } else if (totalScore >= 10) {
                groupData = {
                    letter: 'B',
                    title: 'Estratega',
                    result: 'Semifinal',
                    desc: 'Estás en una buena posición y avanzas constantemente, pero puedes optimizar tus jugadas para llegar más lejos.',
                    quote: '"La estrategia mejora con cada paso."',
                    color: 'bg-[#f5a623] text-black'
                };
            } else if (totalScore >= 6) {
                groupData = {
                    letter: 'C',
                    title: 'Jugador Conservador',
                    result: 'Fase de grupos',
                    desc: 'Juegas a no perder en lugar de jugar a ganar. Es hora de hacer un cambio y buscar crecimiento real.',
                    quote: '"El riesgo más grande es no arriesgar."',
                    color: 'bg-[#eab308] text-black'
                };
            } else {
                groupData = {
                    letter: 'D',
                    title: 'Dinero Dormido',
                    result: 'Eliminado',
                    desc: 'Tu dinero está perdiendo valor frente a la inflación todos los días. Necesitas entrar al juego de inmediato.',
                    quote: '"El tiempo que pasa es valor que se pierde."',
                    color: 'bg-[#9ca3af] text-black'
                };
            }

            const isA = totalScore >= 14;
            const isB = totalScore >= 10 && totalScore < 14;
            const isC = totalScore >= 6 && totalScore < 10;
            const isD = totalScore < 6;

            // Build result view
            const resultHTML = `
                <div class="text-center animate-fade-in" style="animation: quizFadeIn 0.6s ease-out forwards;">
                    <h3 class="font-extrabold text-3xl md:text-5xl mb-10 text-white tracking-tight">Tu dinero ya está jugando el torneo</h3>
                    
                    <!-- Mundial Table -->
                    <div class="mundial-table text-left mb-16">
                        <div class="mundial-table-header">
                            <span>Grupo</span>
                            <span>Resultado</span>
                        </div>
                        
                        <div class="mundial-table-row ${isA ? 'mundial-table-row-active' : ''}">
                            <div class="flex items-center gap-4 text-white font-medium">
                                <span class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0 bg-[#E86A10] text-white">A</span>
                                Constructor de Patrimonio
                            </div>
                            <span class="${isA ? 'text-[#E86A10] font-bold' : 'text-white/50'}">Final</span>
                        </div>

                        <div class="mundial-table-row ${isB ? 'mundial-table-row-active' : ''}">
                            <div class="flex items-center gap-4 text-white font-medium">
                                <span class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0 bg-[#f5a623] text-black">B</span>
                                Estratega
                            </div>
                            <span class="${isB ? 'text-[#E86A10] font-bold' : 'text-white/50'}">Semifinal</span>
                        </div>

                        <div class="mundial-table-row ${isC ? 'mundial-table-row-active' : ''}">
                            <div class="flex items-center gap-4 text-white font-medium">
                                <span class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0 bg-[#eab308] text-black">C</span>
                                Jugador Conservador
                            </div>
                            <span class="${isC ? 'text-[#E86A10] font-bold' : 'text-white/50'}">Fase de grupos</span>
                        </div>

                        <div class="mundial-table-row ${isD ? 'mundial-table-row-active' : ''}">
                            <div class="flex items-center gap-4 text-white font-medium">
                                <span class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0 bg-[#9ca3af] text-black">D</span>
                                Dinero Dormido
                            </div>
                            <span class="${isD ? 'text-[#E86A10] font-bold' : 'text-white/50'}">Eliminado</span>
                        </div>
                    </div>

                    <!-- Result Card -->
                    <div class="bg-[#282828] p-10 md:p-12 rounded-[1.5rem] border border-white/5 text-center relative mt-16 shadow-2xl">
                        <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full ${groupData.color} flex items-center justify-center text-4xl font-extrabold shadow-xl">
                            ${groupData.letter}
                        </div>
                        
                        <div class="pt-8">
                            <h2 class="font-extrabold text-3xl md:text-4xl text-white mb-4 tracking-tight">${groupData.title}</h2>
                            <p class="text-white/90 mb-8 text-xl font-medium">${totalScore} – 18 puntos</p>
                            
                            <p class="text-xl text-white mb-8 leading-relaxed max-w-2xl mx-auto font-medium">
                                ${groupData.desc}
                            </p>
                            
                            <p class="text-2xl font-extrabold italic text-white mb-12">
                                ${groupData.quote}
                            </p>
                            
                            <div class="flex flex-col md:flex-row items-center justify-center gap-8 mt-10">
                                <a href="#contacto" class="cta-pill justify-center text-[#E86A10] bg-white text-lg px-8 py-4">
                                    Conoce la siguiente jugada para tu dinero
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-5 h-5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                </a>
                                <button id="restart-quiz-btn" class="text-white/60 hover:text-white font-bold tracking-widest text-sm uppercase transition-colors text-center leading-tight">
                                    REPETIR<br/>TEST
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Replace full quiz section max-w-xl mx-auto contents 
            const maxWEl = quizSection.querySelector('.max-w-xl.mx-auto');
            if (maxWEl) {
                maxWEl.innerHTML = resultHTML;
            }

            // Handle restart
            document.getElementById('restart-quiz-btn')?.addEventListener('click', () => {
                location.reload();
            });
        };

        // Initialize quiz
        renderQuestion();
    }
});
