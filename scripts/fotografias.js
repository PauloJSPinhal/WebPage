// scripts/fotografias.js

let currentPhotosArray = []; 
let currentIdx = 0;
let currentPasta = "";

export function openLightbox(index, photosArray, pasta) {
    currentPhotosArray = photosArray;
    currentPasta = pasta;
    currentIdx = index;
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = pasta + currentPhotosArray[currentIdx];
    document.getElementById('lightbox').style.display = 'flex';
}

export function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

export function changePhoto(step) {
    currentIdx = (currentIdx + step + currentPhotosArray.length) % currentPhotosArray.length;
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = currentPasta + currentPhotosArray[currentIdx];
}

// Tornar as funções acessíveis pelo HTML (via onclick)
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.changePhoto = changePhoto;

function carregarGaleria(container) {
    // Caminho fixo para evitar erros de leitura de atributos
    const listaUrl = "/webpage/images/fotos/lista.txt";
    const pastaOrigem = "/webpage/images/fotos/";

    container.innerHTML = '<p>A carregar fotos...</p>';

    fetch(listaUrl + '?t=' + new Date().getTime())
        .then(response => {
            if (!response.ok) throw new Error("Erro 404: Ficheiro não encontrado");
            return response.text();
        })
        .then(texto => {
            const itens = texto.split('\n').filter(i => i.trim() !== "");
            container.innerHTML = '<div class="row g-3 gallery"></div>';
            const gallery = container.querySelector('.gallery');
            
            itens.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = "col-md-4";
                // Exemplo de como manter o seu onclick original:
                div.innerHTML = `
                    <img src="${pastaOrigem}${item}" 
                         class="img-fluid rounded" 
                         style="cursor:pointer;"
                         onclick="openLightbox(${index}, ${JSON.stringify(itens).replace(/"/g, "'")}, '${pastaOrigem}')">`;
                gallery.appendChild(div);
            });
        })
        .catch(err => {
            container.innerHTML = `<p class="text-danger">${err.message}</p>`;
        });
}