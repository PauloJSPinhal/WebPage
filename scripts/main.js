$(document).ready(function() {

    // Configuração das Secções e respetivos caminhos de ficheiro externo
    const sections = {
        'ensino': 'html/ensino.html',
        'engenharia': 'html/engenharia.html',
        'fotografia': 'html/fotografia.html',
        'cultura': 'html/cultura.html'
    };

    // Estado para controlar se uma secção já foi carregada via AJAX
    const loadedSections = {};

    // Função centralizada para abrir uma secção
    function openSection(targetId) {
        const $row = $('#row-' + targetId);
        const $content = $('#content-' + targetId);

        // Se já estiver aberta, foca apenas o scroll nela
        if ($row.hasClass('is-open')) {
            scrollToElement($row);
            return;
        }

        // Fecha todas as outras secções abertas antes de abrir a nova (comportamento limpo)
        $('.section-row.is-open').removeClass('is-open').find('.section-content').slideUp(300);

        // Verifica se precisa de carregar o conteúdo via AJAX
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
                    loadedSections[targetId] = true;
                    // Adiciona os event listeners aos novos botões de ação injetados dinamicamente
                    bindActionButtons(targetId);
                    scrollToElement($row);
                },
                error: function() {
                    $content.html('<div class="alert alert-danger">Erro ao carregar o conteúdo da secção. Por favor, tente novamente.</div>');
                }
            });
        } else {
            // Se já foi previamente carregada, apenas abre com animação
            $row.addClass('is-open');
            $content.slideDown(400, function() {
                scrollToElement($row);
            });
        }

        // Sincroniza o estado ativo no menu superior
        $('.nav-link-custom').removeClass('active');
        $(`.nav-link-custom[data-target="${targetId}"]`).addClass('active');
    }

    // Função para fechar uma secção específica
    function closeSection(targetId) {
        const $row = $('#row-' + targetId);
        $row.removeClass('is-open');
        $('#content-' + targetId).slideUp(300);
        
        // Remove active do menu superior correspondente
        $(`.nav-link-custom[data-target="${targetId}"]`).removeClass('active');
        $('.nav-link-custom').first().addClass('active'); // Volta a ativar o "Início"
    }

    // Vincula ações aos botões Internos das secções carregadas
    function bindActionButtons(targetId) {
        // Botão Fechar Secção
        $('#content-' + targetId).on('click', '.btn-action-close', function() {
            closeSection(targetId);
            scrollToElement($('#row-' + targetId));
        });

        // Botão Voltar ao Topo
        $('#content-' + targetId).on('click', '.btn-action-top', function() {
            $('html, body').animate({ scrollTop: 0 }, 400);
        });
    }

    // Auxiliar para scroll suave até ao elemento
    function scrollToElement($element) {
        $('html, body').animate({
            scrollTop: $element.offset().top - 90
        }, 400);
    }

    // HIPÓTESE A: Clicar sobre a linha (Header da secção)
    $('.section-header').on('click', function() {
        const target = $(this).data('target');
        const $row = $('#row-' + target);
        
        if ($row.hasClass('is-open')) {
            closeSection(target);
        } else {
            openSection(target);
        }
    });

    // HIPÓTESE B: Clicar nos links do Menu Superior
    $('.nav-link-custom[data-target]').on('click', function(e) {
        e.preventDefault();
        const target = $(this).data('target');
        openSection(target);
    });

    // HIPÓTESE C: Clicar num slide do Carousel
    $('.carousel-item').on('click', function() {
        const target = $(this).data('target');
        openSection(target);
    });


    // --- VALIDAÇÃO DO FORMULÁRIO DE CONTACTO ---
    $('#contactForm').on('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // 1. Validar Radio Button (Categoria do Assunto)
        const radioChecked = $('input[name="assuntoCategoria"]:checked').val();
        if (!radioChecked) {
            $('#radioError').removeClass('d-none');
            isValid = false;
        } else {
            $('#radioError').addClass('d-none');
        }

        // 2. Validar Email (HTML5 validation builtin + check)
        const emailInput = $('#emailInput')[0];
        if (!emailInput.checkValidity()) {
            $(emailInput).addClass('is-invalid');
            isValid = false;
        } else {
            $(emailInput).removeClass('is-invalid').addClass('is-valid');
        }

        // 3. Validar Campo de Texto do Assunto/Mensagem
        const mensagemInput = $('#mensagemInput').val().trim();
        if (mensagemInput === '') {
            $('#mensagemInput').addClass('is-invalid');
            isValid = false;
        } else {
            $('#mensagemInput').removeClass('is-invalid').addClass('is-valid');
        }

        // Se tudo estiver correto, mostra alerta de sucesso
        if (isValid) {
            $('#formSuccessAlert').removeClass('d-none');
            // Aqui seria feito o envio real AJAX se necessário
            // ex: this.submit(); ou $.post(...);
        } else {
            $('#formSuccessAlert').addClass('d-none');
        }
    });

    // Limpar avisos de erro enquanto o utilizador preenche
    $('input[name="assuntoCategoria"]').on('change', function() {
        $('#radioError').addClass('d-none');
    });
    $('#emailInput, #mensagemInput').on('input', function() {
        if ($(this).val().trim() !== '') {
            $(this).removeClass('is-invalid');
        }
    });
});
