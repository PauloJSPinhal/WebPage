 $(document).ready(function() {

    const sections = {
        'ensino': 'html/ensino.html',
        'engenharia': 'html/engenharia.html',
        'fotografia': 'html/fotografia.html',
        'cultura': 'html/cultura.html'
    };

    const loadedSections = {};

        function openSection(targetId) {
        const $row = $('#row-' + targetId);
        const $content = $('#content-' + targetId);

        if ($row.hasClass('is-open')) {
            scrollToElement($row);
            return;
        }

        // Fecha outras secções abertas
        $('.section-row.is-open').removeClass('is-open').find('.section-content').slideUp(300);

        if (!loadedSections[targetId]) {
            $content.html('<div class="text-center p-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2 text-muted">A carregar conteúdo...</p></div>');
            $row.addClass('is-open');
            $content.slideDown(400);

            $.ajax({
                url: sections[targetId],
                type: 'GET',
                dataType: 'html',
                success: function(data) {
                    $content.html(data);
                    
                    // Marca como carregada para não repetir o AJAX da próxima vez
                    loadedSections[targetId] = true;

                    // ==========================================
                    // INICIALIZAÇÃO AUTOMÁTICA DOS MOTORES
                    // ==========================================
                    
                    // 1. Procura Galerias de Fotos e ativa o motor fotografias.js
                    $content.find('.master-galeria-container').each(function() {
                        if (window.carregarGaleria) {
                            window.carregarGaleria(this);
                        }
                    });

                    // 2. Procura Conteúdos Dinâmicos e ativa o motor conteudos.js
                    $content.find('.conteudo-dinamico-container').each(function() {
                        if (window.carregarConteudoDinamico) {
                            window.carregarConteudoDinamico(this);
                        }
                    });

                    // ==========================================

                    // Ativa os botões de fechar e voltar ao topo
                    bindActionButtons(targetId);
                },
                error: function() {
                    $content.html('<p class="text-danger text-center p-3">Erro ao carregar a secção.</p>');
                }
            });
        } else {
            // Se já foi carregada antes, apenas abre
            $row.addClass('is-open');
            $content.slideDown(400);
            scrollToElement($row);
        }
    }

    function closeSection(targetId) {
        const $row = $('#row-' + targetId);
        $row.removeClass('is-open');
        $('#content-' + targetId).slideUp(300);
        $(`.nav-link-custom[data-target="${targetId}"]`).removeClass('active');
        $('.nav-link-custom').first().addClass('active');
    }

    function bindActionButtons(targetId) {
        $('#content-' + targetId).off('click', '.btn-action-close').on('click', '.btn-action-close', function() {
            closeSection(targetId);
            scrollToElement($('#row-' + targetId));
        });

        $('#content-' + targetId).off('click', '.btn-action-top').on('click', '.btn-action-top', function() {
            $('html, body').animate({ scrollTop: 0 }, 400);
        });
    }

    function scrollToElement($element) {
        $('html, body').animate({
            scrollTop: $element.offset().top - 90
        }, 400);
    }

    // Clicar no Header da Secção
    $('.section-header').on('click', function() {
        const target = $(this).data('target');
        if ($('#row-' + target).hasClass('is-open')) {
            closeSection(target);
        } else {
            openSection(target);
        }
    });

    // Clicar nos links do Menu Superior
    $('.nav-link-custom[data-target]').on('click', function(e) {
        e.preventDefault();
        const target = $(this).data('target');
        $('.nav-link-custom').removeClass('active');
        $(this).addClass('active');
        openSection(target);
    });

    // Clicar num slide do Carousel
    $('.carousel-item').on('click', function() {
        const target = $(this).data('target');
        openSection(target);
    });

    // Validação do Formulário de Contacto
    $('#contactForm').on('submit', function(e) {
        e.preventDefault();
        let isValid = true;
        
        const radioChecked = $('input[name="assuntoCategoria"]:checked').val();
        if (!radioChecked) {
            $('#radioError').removeClass('d-none');
            isValid = false;
        } else {
            $('#radioError').addClass('d-none');
        }

        const emailInput = $('#emailInput')[0];
        if (!emailInput.checkValidity()) {
            $(emailInput).addClass('is-invalid');
            isValid = false;
        } else {
            $(emailInput).removeClass('is-invalid').addClass('is-valid');
        }

        const mensagemInput = $('#mensagemInput').val().trim();
        if (mensagemInput === '') {
            $('#mensagemInput').addClass('is-invalid');
            isValid = false;
        } else {
            $('#mensagemInput').removeClass('is-invalid').addClass('is-valid');
        }

        if (isValid) {
            $('#formSuccessAlert').removeClass('d-none');
        } else {
            $('#formSuccessAlert').addClass('d-none');
        }
    });

    // Limpar avisos de erro
    $('input[name="assuntoCategoria"]').on('change', function() {
        $('#radioError').addClass('d-none');
    });
    $('#emailInput, #mensagemInput').on('input', function() {
        if ($(this).val().trim() !== '') {
            $(this).removeClass('is-invalid');
        }
    });
});