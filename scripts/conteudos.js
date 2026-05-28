// scripts/conteudos.js

// Função auxiliar para extrair o ID do YouTube
function getYoutubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function carregarConteudoDinamico(masterContainer) {
    const listaUrl = masterContainer.getAttribute('data-lista');
    const pastaOrigem = masterContainer.getAttribute('data-pasta');

    if (!listaUrl || !pastaOrigem) {
        masterContainer.innerHTML = '<p class="text-danger">Erro: Falta definir data-lista ou data-pasta.</p>';
        return;
    }

    masterContainer.innerHTML = '<p class="text-center text-muted mt-3">A carregar conteúdos...</p>';

    fetch(listaUrl + '?t=' + new Date().getTime())
        .then(response => {
            if (!response.ok) throw new Error("Erro ao carregar o ficheiro de conteúdos");
            return response.text();
        })
        .then(texto => {
            const linhas = texto.split('\n');
            const grupos = [];
            let tituloAtual = 'Sem Título';
            let descAtual = '';
            let itensAtuais = [];

            // 1. PARSE
            linhas.forEach(linha => {
                const trimLinha = linha.trim();
                if (trimLinha === '' || trimLinha.startsWith('//')) return;

                if (trimLinha.startsWith('#')) {
                    if (itensAtuais.length > 0) grupos.push({ titulo: tituloAtual, desc: descAtual, itens: itensAtuais });
                    itensAtuais = [];
                    tituloAtual = trimLinha.substring(1).trim();
                    descAtual = '';
                } else if (trimLinha.startsWith('>')) {
                    descAtual += (descAtual ? '<br>' : '') + trimLinha.substring(1).trim();
                } else if (trimLinha === '---') {
                    if (itensAtuais.length > 0) grupos.push({ titulo: tituloAtual, desc: descAtual, itens: itensAtuais });
                    itensAtuais = [];
                    tituloAtual = '';
                    descAtual = '';
                } else {
                    let tipo = 'desconhecido';
                    let conteudoLinha = trimLinha;

                    if (trimLinha.startsWith('[PDF]')) { tipo = 'pdf'; conteudoLinha = trimLinha.substring(5).trim(); }
                    else if (trimLinha.startsWith('[ZIP]')) { tipo = 'zip'; conteudoLinha = trimLinha.substring(5).trim(); }
                    else if (trimLinha.startsWith('[LINK]')) { tipo = 'link'; conteudoLinha = trimLinha.substring(6).trim(); }
                    else if (trimLinha.startsWith('[YOUTUBE]')) { tipo = 'youtube'; conteudoLinha = trimLinha.substring(9).trim(); }
                    else if (trimLinha.startsWith('[VIDEO]')) { tipo = 'video'; conteudoLinha = trimLinha.substring(7).trim(); }
                    else if (trimLinha.startsWith('[IMG]')) { tipo = 'img'; conteudoLinha = trimLinha.substring(5).trim(); }
                    else if (trimLinha.startsWith('[MUSICA]')) { tipo = 'musica'; conteudoLinha = trimLinha.substring(8).trim(); }
                    else if (trimLinha.startsWith('[FILME]')) { tipo = 'filme'; conteudoLinha = trimLinha.substring(7).trim(); }
                    const partes = conteudoLinha.split('|').map(p => p.trim());
                    if (partes.length >= 2) {
                        itensAtuais.push({ tipo: tipo, nome: partes[0], ficheiro: partes[1], ficheiro2: partes[2] || '', data: partes[3] || partes[2] || '' });
                    } else if (partes.length === 1 && tipo === 'img') {
                        itensAtuais.push({ tipo: 'img', nome: '', ficheiro: partes[0], ficheiro2: '', data: '' });
                    }
                }
            });
            if (itensAtuais.length > 0) grupos.push({ titulo: tituloAtual, desc: descAtual, itens: itensAtuais });

            // 2. RENDERIZAÇÃO NO ECRÃ
            masterContainer.innerHTML = '';

            grupos.forEach(grupo => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'conteudo-group';
                
                const headerDiv = document.createElement('div');
                headerDiv.className = 'conteudo-group-header';
                headerDiv.innerHTML = `
                    <div>
                        <h4><i class="fa-solid fa-folder-closed me-2"></i>${grupo.titulo}</h4>
                        ${grupo.desc ? `<p style="margin-top:5px;">${grupo.desc}</p>` : ''}
                    </div>
                    <i class="fa-solid fa-eye-slash toggle-icon"></i>
                `;

                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'group-content-wrapper';

                let listaIndex = 0; // Contador partilhado

                grupo.itens.forEach(item => {
                    
                    // ITENS DE LISTA NORMAIS (Sem imagem) - O teu código antigo intacto
                    if (['pdf', 'zip', 'link'].includes(item.tipo)) {
                        listaIndex++;
                        const ul = contentWrapper.querySelector('.conteudo-list') || document.createElement('ul');
                        ul.className = 'conteudo-list';
                        const li = document.createElement('li');
                        
                        let icone = '';
                        let target = '';
                        if (item.tipo === 'pdf') { icone = 'fa-solid fa-file-pdf icon-pdf'; target = 'target="_blank"'; }
                        if (item.tipo === 'zip') { icone = 'fa-solid fa-file-zipper icon-zip'; target = 'download'; }
                        if (item.tipo === 'link') { icone = 'fa-solid fa-arrow-up-right-from-square icon-link'; target = 'target="_blank" rel="noopener"'; }

                        const caminho = (item.tipo === 'link') ? item.ficheiro : pastaOrigem + item.ficheiro;
                        
                        li.innerHTML = `
                            <span class="item-num">${String(listaIndex).padStart(2, '0')}</span>
                            <a href="${caminho}" class="item-link" ${target}>
                                <i class="${icone}"></i>${item.nome}
                            </a>
                            ${item.data ? `<span class="item-date"><i class="fa-regular fa-calendar me-1"></i>${item.data}</span>` : ''}
                        `;
                        ul.appendChild(li);
                        if (!contentWrapper.querySelector('.conteudo-list')) contentWrapper.appendChild(ul);
                    } 
                    
                    // ITENS COM IMAGEM (Música)
                    else if (item.tipo === 'musica') {
                        listaIndex++;
                        const ul = contentWrapper.querySelector('.conteudo-list') || document.createElement('ul');
                        ul.className = 'conteudo-list';
                        const li = document.createElement('li');
                        
                        // Repara que agora temos a thumbnail antes do número
                        li.innerHTML = `
                            <img src="${pastaOrigem}${item.ficheiro}" alt="Capa" class="media-thumb">
                            <span class="item-num">${String(listaIndex).padStart(2, '0')}</span>
                            <a href="${item.ficheiro2}" target="_blank" class="item-link">
                                <i class="fa-brands fa-youtube icon-link"></i>${item.nome}
                            </a>
                            ${item.data ? `<span class="item-date"><i class="fa-regular fa-calendar me-1"></i>${item.data}</span>` : ''}
                        `;
                        ul.appendChild(li);
                        if (!contentWrapper.querySelector('.conteudo-list')) contentWrapper.appendChild(ul);
                    }
                    // --- NOVO: FICHA DE CINEMA ---
                    else if (item.tipo === 'filme') {
                        const cardDiv = document.createElement('div');
                        cardDiv.className = 'filme-card';
                        
                        // Verifica se existe link de trailer
                        const trailerBtn = item.data ? 
                            `<div class="filme-action"><a href="${item.data}" target="_blank" class="btn-trailer"><i class="fa-solid fa-play me-2"></i>Trailer</a></div>` : 
                            '';

                        cardDiv.innerHTML = `
                            <img src="${pastaOrigem}${item.ficheiro}" alt="${item.nome}" class="filme-poster">
                            <div class="filme-info">
                                <h6 class="filme-titulo">${item.nome}</h6>
                                <p class="filme-sinopse">${item.ficheiro2}</p>
                            </div>
                            ${trailerBtn}
                        `;
                        contentWrapper.appendChild(cardDiv);
                    }
                    // YOUTUBE, VIDEO, IMG
                    else if (item.tipo === 'youtube') {
                        const videoId = getYoutubeId(item.ficheiro);
                        if (videoId) {
                            const embedDiv = document.createElement('div');
                            embedDiv.innerHTML = `
                                <div class="media-embed-container"><iframe src="https://www.youtube.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
                                <p class="media-title"><i class="fa-brands fa-youtube me-2" style="color:red"></i>${item.nome}</p>
                            `;
                            contentWrapper.appendChild(embedDiv);
                        }
                    } 
                    else if (item.tipo === 'video') {
                        const vidDiv = document.createElement('div');
                        vidDiv.innerHTML = `
                            <div class="media-embed-container"><video controls><source src="${pastaOrigem}${item.ficheiro}" type="video/mp4">O seu navegador não suporta a tag de vídeo.</video></div>
                            <p class="media-title"><i class="fa-solid fa-film me-2" style="color:#2563eb"></i>${item.nome}</p>
                        `;
                        contentWrapper.appendChild(vidDiv);
                    }
                    else if (item.tipo === 'img') {
                        const imgDiv = document.createElement('div');
                        imgDiv.className = 'single-image-container';
                        imgDiv.innerHTML = `
                            <img src="${pastaOrigem}${item.ficheiro}" alt="${item.nome}" class="img-fluid">
                            ${item.nome ? `<p class="single-image-caption">${item.nome}</p>` : ''}
                        `;
                        contentWrapper.appendChild(imgDiv);
                    }
                });

                // MONTAR ESTRUTURA
                groupDiv.appendChild(headerDiv);
                groupDiv.appendChild(contentWrapper);
                masterContainer.appendChild(groupDiv);

                // AÇÃO DE CLIQUE (Intacto)
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
            });
        })
        .catch(err => {
            masterContainer.innerHTML = `<p class="text-danger">${err.message}</p>`;
        });
}

window.carregarConteudoDinamico = carregarConteudoDinamico;