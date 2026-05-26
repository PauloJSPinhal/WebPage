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

function carregarGaleria(container) {
    const listaUrl = container.getAttribute('data-lista');
    const pastaOrigem = container.getAttribute('data-pasta');

    if (!listaUrl || !pastaOrigem) {
        container.innerHTML = '<p class="text-danger">Erro: Falta definir data-lista ou data-pasta no HTML.</p>';
        return;
    }

    container.innerHTML = '<p class="text-center text-muted mt-3">A carregar fotos...</p>';

    fetch(listaUrl + '?t=' + new Date().getTime())
        .then(response => {
            if (!response.ok) throw new Error("Erro ao carregar a lista de fotos");
            return response.text();
        })
        .then(texto => {
            const itens = texto.split('\n').filter(i => i.trim() !== "");
            
            // NOVA LÓGICA: Criar o cabeçalho se existirem os atributos
            let headerHTML = '';
            const titulo = container.getAttribute('data-titulo');
            const descricao = container.getAttribute('data-descricao');
            
            if (titulo || descricao) {
                headerHTML += '<div class="gallery-header">';
                if (titulo) headerHTML += `<h4>${titulo}</h4>`;
                if (descricao) headerHTML += `<p>${descricao}</p>`;
                headerHTML += '</div>';
            }

            // O innerHTML agora inclui o cabeçalho (se existir) + a div das fotos
            container.innerHTML = headerHTML + '<div class="row g-3 gallery"></div>';
            
            const gallery = container.querySelector('.gallery');
            
            itens.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = "col-md-4 col-sm-6";
                
                const img = document.createElement('img');
                img.src = pastaOrigem + item;
                img.className = "img-fluid rounded";
                img.style.cursor = "pointer";
                
                img.addEventListener('click', () => {
                    openLightbox(index, itens, pastaOrigem);
                });

                div.appendChild(img);
                gallery.appendChild(div);
            });
        })
        .catch(err => {
            container.innerHTML = `<p class="text-danger">${err.message}</p>`;
        });
}

// Tornar a função de carregar acessível ao main.js
window.carregarGaleria = carregarGaleria;