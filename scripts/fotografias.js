// scripts/fotografias.js

let currentPhotosArray = []; 
let currentIdx = 0;
let currentPasta = "";

function openLightbox(index, photosArray, pasta) {
    currentPhotosArray = photosArray;
    currentPasta = pasta;
    currentIdx = index;
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = pasta + currentPhotosArray[currentIdx];
    document.getElementById('lightbox').style.display = 'flex';
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

function changePhoto(step) {
    currentIdx = (currentIdx + step + currentPhotosArray.length) % currentPhotosArray.length;
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = currentPasta + currentPhotosArray[currentIdx];
}

// Tornar as funções acessíveis globalmente (para os botões do HTML)
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.changePhoto = changePhoto;

function carregarGaleria(masterContainer) {
    const listaUrl = masterContainer.getAttribute('data-lista');
    const pastaOrigem = masterContainer.getAttribute('data-pasta');

    if (!listaUrl || !pastaOrigem) {
        masterContainer.innerHTML = '<p class="text-danger">Erro: Falta definir data-lista ou data-pasta.</p>';
        return;
    }

    masterContainer.innerHTML = '<p class="text-center text-muted mt-3">A carregar galerias...</p>';

    fetch(listaUrl + '?t=' + new Date().getTime())
        .then(response => {
            if (!response.ok) throw new Error("Erro ao carregar o ficheiro de galerias");
            return response.text();
        })
        .then(texto => {
            const linhas = texto.split('\n');
            const galerias = []; // Vai guardar os grupos de fotos
            
            let tituloAtual = '';
            let descAtual = '';
            let fotosAtuais = [];

            // 1. PARSE: Ler o ficheiro de texto e agrupar
            linhas.forEach(linha => {
                const trimLinha = linha.trim();
                
                // Ignora linhas vazias ou comentários
                if (trimLinha === '' || trimLinha.startsWith('//')) return;

                if (trimLinha.startsWith('#')) {
                    // Se já tinha fotos guardadas, guarda o grupo anterior antes de começar um novo
                    if (fotosAtuais.length > 0) {
                        galerias.push({ titulo: tituloAtual, desc: descAtual, fotos: fotosAtuais });
                        fotosAtuais = [];
                    }
                    tituloAtual = trimLinha.substring(1).trim();
                    descAtual = '';
                } 
                else if (trimLinha.startsWith('>')) {
                    // Adiciona a descrição (permite múltiplas linhas de descrição)
                    descAtual += (descAtual ? '<br>' : '') + trimLinha.substring(1).trim();
                } 
                else if (trimLinha === '---') {
                    // Separador explícito de galerias
                    if (fotosAtuais.length > 0) {
                        galerias.push({ titulo: tituloAtual, desc: descAtual, fotos: fotosAtuais });
                        fotosAtuais = [];
                        tituloAtual = '';
                        descAtual = '';
                    }
                } 
                else {
                    // É o nome de uma imagem
                    fotosAtuais.push(trimLinha);
                }
            });
            // Guarda o último grupo após sair do loop
            if (fotosAtuais.length > 0) {
                galerias.push({ titulo: tituloAtual, desc: descAtual, fotos: fotosAtuais });
            }

            // 2. RENDER: Desenhar o HTML na página
            masterContainer.innerHTML = ''; // Limpa o "A carregar..."

            galerias.forEach(gal => {
                // Cria a div da galeria
                const galDiv = document.createElement('div');
                galDiv.className = 'galeria-container mb-5';

                // Cria o Cabeçalho (Título e Descrição)
                if (gal.titulo || gal.desc) {
                    const header = document.createElement('div');
                    header.className = 'gallery-header';
                    if (gal.titulo) header.innerHTML += `<h4>${gal.titulo}</h4>`;
                    if (gal.desc) header.innerHTML += `<p>${gal.desc}</p>`;
                    galDiv.appendChild(header);
                }

                // Cria a Grelha de Fotos
                const grid = document.createElement('div');
                grid.className = 'row g-3 gallery';

                gal.fotos.forEach((foto, index) => {
                    const col = document.createElement('div');
                    col.className = 'col-md-4 col-sm-6';
                    
                    const img = document.createElement('img');
                    img.src = pastaOrigem + foto;
                    img.className = 'img-fluid rounded';
                    img.style.cursor = "pointer";
                    
                    // Evento de clique (passa APENAS as fotos deste grupo específico para o Lightbox)
                    img.addEventListener('click', () => {
                        openLightbox(index, gal.fotos, pastaOrigem);
                    });

                    col.appendChild(img);
                    grid.appendChild(col);
                });

                galDiv.appendChild(grid);
                masterContainer.appendChild(galDiv);
            });

        })
        .catch(err => {
            masterContainer.innerHTML = `<p class="text-danger">${err.message}</p>`;
        });
}

// Mantém a função acessível ao main.js
window.carregarGaleria = carregarGaleria;