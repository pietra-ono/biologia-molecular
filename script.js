(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. FUNÇÃO DE ROLAGEM SUAVE PARA ÂNCORAS
  ---------------------------------------------------------- */
  function scrollParaSecao(targetId) {
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Rolagem suave
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Opcional: destaque visual ao chegar
      targetElement.style.transition = 'background 0.3s ease';
      targetElement.style.background = 'rgba(255, 255, 200, 0.15)';
      setTimeout(() => {
        targetElement.style.background = '';
      }, 1000);

      console.log('Rolou para:', targetId); // Debug
      return true;
    } else {
      console.log('Elemento não encontrado:', targetId);
      return false;
    }
  }

  /* ----------------------------------------------------------
     2. CAPTURA CLIQUE NAS ÂNCORAS (imagens)
  ---------------------------------------------------------- */
  // Usa event delegation para garantir que elementos dinâmicos também funcionem
  document.body.addEventListener('click', function (e) {
    // Procura o elemento .ancora ou qualquer elemento com data-target
    let ancora = e.target.closest('.ancora');

    if (!ancora) {
      // Se não achou .ancora, procura qualquer elemento com data-target
      ancora = e.target.closest('[data-target]');
    }

    if (ancora) {
      e.preventDefault();
      const targetId = ancora.getAttribute('data-target');
      console.log('Clique detectado! Target:', targetId);

      if (targetId) {
        scrollParaSecao(targetId);
      }
    }
  });

  /* ----------------------------------------------------------
     3. TAMBÉM CAPTURA CLIQUE NAS IMAGENS DENTRO DE .galeria-titulo
  ---------------------------------------------------------- */
  document.querySelectorAll('.galeria-titulo img, .ancora img').forEach(img => {
    // Garante que a imagem tem cursor pointer
    img.style.cursor = 'pointer';

    img.addEventListener('click', function (e) {
      e.stopPropagation();
      const parentAncora = this.closest('.ancora');
      if (parentAncora) {
        const targetId = parentAncora.getAttribute('data-target');
        console.log('Imagem clicada! Target:', targetId);
        if (targetId) {
          scrollParaSecao(targetId);
        }
      }
    });
  });

  /* ----------------------------------------------------------
     4. INTERSECTION OBSERVER — reveal ao scroll
  ---------------------------------------------------------- */
  const opcoesReveal = {
    threshold: 0.08,
    rootMargin: '0px 0px -20px 0px'
  };

  const observadorReveal = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel');
        observadorReveal.unobserve(entrada.target);
      }
    });
  }, opcoesReveal);

  document.querySelectorAll('.reveal, .img-item').forEach(el => {
    observadorReveal.observe(el);
  });

  document.querySelectorAll('.reveal-section').forEach(el => {
    const rect = el.getBoundingClientRect();
    const jaVisivel = rect.top < window.innerHeight && rect.bottom > 0;
    if (!jaVisivel) {
      el.classList.add('animando');
    }
    observadorReveal.observe(el);
  });

  /* ----------------------------------------------------------
     5. TICKER — duplica conteúdo para loop infinito
  ---------------------------------------------------------- */
  const stripInner = document.querySelector('.photo-strip-inner');
  if (stripInner) {
    const clone = stripInner.innerHTML;
    stripInner.innerHTML = clone + clone;
  }

  /* ----------------------------------------------------------
     6. POST-ITS — clique navega para âncora destino
  ---------------------------------------------------------- */
  document.querySelectorAll('.topic[href]').forEach(topic => {
    topic.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        topic.click();
      }
    });
  });

  /* ----------------------------------------------------------
     7. EFEITO MANUSCRITO
  ---------------------------------------------------------- */
  const prefereReducao = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const opcoesEscrita = { threshold: 0.3 };

  const observadorEscrita = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;

      const papel = entrada.target;
      papel.style.clipPath = 'inset(0 100% 0 0)';
      papel.style.transition = 'clip-path 0.9s cubic-bezier(0.25,0.46,0.45,0.94)';

      papel.getBoundingClientRect();
      papel.style.clipPath = 'inset(0 0% 0 0)';

      observadorEscrita.unobserve(papel);
    });
  }, opcoesEscrita);

  if (!prefereReducao) {
    document.querySelectorAll('.texto-papel, .texto-2').forEach(el => {
      const rect = el.getBoundingClientRect();
      const jaVisivel = rect.top < window.innerHeight && rect.bottom > 0;
      if (!jaVisivel) {
        observadorEscrita.observe(el);
      }
    });
  }

  // Mensagem de confirmação no console
  console.log('✅ Âncoras carregadas! Clique em qualquer imagem com .ancora ou data-target');
})();

/* ----------------------------------------------------------
   8. NAVEGAÇÃO DO GLOSSÁRIO - Menu por letras
---------------------------------------------------------- */
function initGlossarioNavegacao() {
  const botoesTopo = document.querySelectorAll('#glossarioLetrasMenuTopo .letra-btn');
  const botoesInterno = document.querySelectorAll('#glossarioLetrasMenuInterno .letra-interna-btn');
  const todasLetras = document.querySelectorAll('.glossario-letra');

  // Função para rolar até a letra
  function scrollToLetra(letra) {
    const elementoLetra = document.getElementById(`letra-${letra}`);
    if (elementoLetra) {
      // Calcula offset considerando o header fixo e o menu topo
      const header = document.querySelector('header');
      const menuTopo = document.querySelector('.glossario-nav-topo');
      let offset = 100; // valor padrão

      if (header) offset = header.offsetHeight + 20;
      if (menuTopo && menuTopo.style.display !== 'none') offset += menuTopo.offsetHeight;

      const elementPosition = elementoLetra.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Destaque temporário
      elementoLetra.style.transition = 'background 0.3s ease';
      elementoLetra.style.background = 'rgba(255, 255, 200, 0.3)';
      setTimeout(() => {
        elementoLetra.style.background = '';
      }, 800);

      // Atualiza botões ativos
      atualizarBotoesAtivos(letra);
    }
  }

  // Atualiza qual botão está ativo
  function atualizarBotoesAtivos(letraAtiva) {
    botoesTopo.forEach(btn => {
      const btnLetra = btn.getAttribute('data-letra');
      if (btnLetra === letraAtiva) {
        btn.classList.add('ativo');
      } else {
        btn.classList.remove('ativo');
      }
    });

    botoesInterno.forEach(btn => {
      const btnLetra = btn.getAttribute('data-letra');
      if (btnLetra === letraAtiva) {
        btn.classList.add('ativo');
      } else {
        btn.classList.remove('ativo');
      }
    });
  }

  // Detecta qual letra está visível na tela (para manter o menu atualizado)
  function detectarLetraVisivel() {
    const letras = document.querySelectorAll('.glossario-letra');
    const offset = 200;

    for (const letra of letras) {
      const rect = letra.getBoundingClientRect();
      if (rect.top < offset && rect.bottom > offset) {
        const id = letra.getAttribute('id');
        if (id) {
          const letraId = id.replace('letra-', '');
          atualizarBotoesAtivos(letraId);
        }
        break;
      }
    }
  }

  // Adiciona event listeners para os botões
  botoesTopo.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const letra = btn.getAttribute('data-letra');
      scrollToLetra(letra);
    });
  });

  botoesInterno.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const letra = btn.getAttribute('data-letra');
      scrollToLetra(letra);
    });
  });

  // Observa scroll para atualizar botão ativo
  window.addEventListener('scroll', () => {
    requestAnimationFrame(detectarLetraVisivel);
  });

  // Anima as letras conforme aparecem no scroll
  const observerLetras = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-letra');
        observerLetras.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.glossario-letra').forEach(letra => {
    observerLetras.observe(letra);
  });

  // Pequeno delay para detectar letra inicial
  setTimeout(detectarLetraVisivel, 500);
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlossarioNavegacao);
} else {
  initGlossarioNavegacao();
}

/* ----------------------------------------------------------
   9. REVELAÇÃO DAS REFERÊNCIAS (adicione ao script.js)
---------------------------------------------------------- */
function initReferenciasReveal() {
  const referenciasItems = document.querySelectorAll('.referencia-item');

  if (referenciasItems.length === 0) return;

  const observerRefs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-ref');
        observerRefs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

  referenciasItems.forEach(item => {
    observerRefs.observe(item);
  });
}

// Inicializa a revelação das referências
initReferenciasReveal();