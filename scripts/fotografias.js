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
    
    // Ir buscar o título e descrição do HTML
    const titulo = masterContainer.getAttribute('data-titulo');
    const descricao = masterContainer.getAttribute('data-descricao');

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
            const fotos = texto.split('\n').filter(i => i.trim() !== "");
            masterContainer.innerHTML = ''; 

            // 1. CABEÇALHO (Reaproveita as classes do conteudos.js)
            const headerDiv = document.createElement('div');
            headerDiv.className = 'conteudo-group-header';
            headerDiv.innerHTML = `
                <div>
                    <h4><i class="fa-solid fa-folder-closed me-2"></i>${titulo || 'Galeria'}</h4>
                    ${descricao ? `<p style="margin-top:5px;">${descricao}</p>` : ''}
                </div>
                <i class="fa-solid fa-eye-slash toggle-icon"></i>
            `;

            // 2. CONTENTOR DOS ITENS (Fica escondido por defeito via CSS)
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'group-content-wrapper';

            // 3. GRELHA DE FOTOS (Dentro do contentor escondido)
            const grid = document.createElement('div');
            grid.className = 'row g-3 gallery';

            fotos.forEach((foto, index) => {
                const col = document.createElement('div');
                col.className = 'col-md-4 col-sm-6';
                
                const img = document.createElement('img');
                img.src = pastaOrigem + foto;
                img.className = 'img-fluid rounded';
                img.style.cursor = "pointer";
                
                img.addEventListener('click', () => {
                    openLightbox(index, fotos, pastaOrigem);
                });

                col.appendChild(img);
                grid.appendChild(col);
            });

            // Montar a estrutura final
            contentWrapper.appendChild(grid);
            masterContainer.appendChild(headerDiv);
            masterContainer.appendChild(contentWrapper);

            // 4. AÇÃO DE CLIQUE (Lógica idêntica ao conteudos.js)
            $(headerDiv).on('click', function() {
                const icon = $(this).find('.toggle-icon');
                const folderIcon = $(this).find('h4 i');
                
                $(contentWrapper).slideToggle(300);
                
                if ($(contentWrapper).is(':visible')) {
                    icon.removeClass('fa-eye-slash').addClass('fa-eye');
                    folderIcon.removeClass('fa-folder-closed').addClass('fa-folder-open');
                } else {
                    icon.removeClass('fa-eye').addClass('fa-eye-slash');
                    folderIcon.removeClass('fa-folder-open').addClass('fa-folder-closed');
                }
            });

        })
        .catch(err => {
            masterContainer.innerHTML = `<p class="text-danger">${err.message}</p>`;
        });
}

// Mantém a função acessível ao main.js
window.carregarGaleria = carregarGaleria;