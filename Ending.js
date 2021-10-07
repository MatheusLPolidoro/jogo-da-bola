const somPulo = new Audio();
somPulo.src = './select.wav';

// definição de variáveis
var canvas, ctx, ALTURA, LARGURA, frames = 0, maxPulo = 3, velocidade = 6,
estadoAtual, recorde, img, pontosParaNovaFase = [5, 10, 15, 20], faseAtual = 0,
labelNovaFase = {
    texto: "",
    opacidade: 0.0,

    fadeIn:function(tempo){
        var fadeInId = setInterval(function(){
            if (labelNovaFase.opacidade < 1){
                labelNovaFase.opacidade += 0.01;
            }else{
                clearInterval(fadeInId);
            }
        }, 10 * tempo);
    },

    fadeOut: function(tempo){
        var fadeOutId = setInterval(function(){
            if (labelNovaFase.opacidade > 0){
                labelNovaFase.opacidade -= 0.01;
            }else{
                clearInterval(fadeOutId);
            }
        }, 10 * tempo);
    }
},

// abreviar algum tipo de estados com strings
estados = {
    jogar: 0,
    jogando: 1,
    perdeu: 2,
},

// definição de variaveis semelhantes a objetos
chao = {
    //cor: "#ffdf70", // cor do chão
    y: 550, // posição inicial eixo y
    x: 0, // movimentação do chão
    altura: 50, // tamanho da altura do chão

    atualiza: function(){
        this.x -= velocidade;

        if (this.x <= -30){
            this.x += 30;
        }
    },

    // desenhar o chão no contexto
    desenha: function(){
        //ctx.fillStyle = this.cor;
        //ctx.fillRect(0, this.y, LARGURA, this.altura);
        spriteChao.desenha(this.x, this.y);
        spriteChao.desenha(this.x + spriteChao.largura, this.y );
    }
},

bloco = {
    //cor: "#ff4e4e", // cor do bloco 
    x: 50, // posição inicial eixo x
    y: 0, // posição inicial eixo y
    altura: spriteBoneco.altura, // dimensão da altura da figura do personagem
    largura: spriteBoneco.largura, // dimenção da largura da figura do personagem
    rotacao: 0,
    vidas: 3,
    colidindo: false,

    score: 0, // contagem do score de obstaculos pulados

    gravidade: 1.6, // definição do valor inicial da gravidade 
    velocidade: 0, // velocidade inicial
    forcaDoPulo: 23.6, // força de cada pulo
    qtdPulo: 0, // quantidade de pulos que o personagem já deu

    atualiza: function(){
        this.velocidade += this.gravidade; // velocidade aumenta de acordo com o valor da gravidade a cada volta do loop
        this.y += this.velocidade; // movimentação do eixo y incrementada com a velocidade (quando pular a valocidade é negativa, fazendo com que o eixo y suba)

        this.rotacao += Math.PI / 180 * velocidade; // responsavel por calcular a rotação

        // se o valor da posição y do personagem for maior que a posição de y do chão - altura do personagem, então fixar o valor de y do personagem no valor da posição y do chao - a altura do chão. Somente se não tiver perdido
        if (this.y > chao.y - this.altura && estadoAtual != estados.perdeu){
            this.y = chao.y - this.altura;  // não permitir passar do chao (firmar o chao)
            this.qtdPulo = 0; // zerar a quantidade de pulos
            this.velocidade = 0; // zerar a velocidade
        }
    },

    // restaurar os atributos do bloco para o estado inicial
    reset: function(){
        this.velocidade = 0; // zerar a velocidade do personagem
        this.y = 0; // zerar o y do personagem
        this.vidas = 3 // restaurar as vidas

        if (bloco.score > recorde){
            recorde = this.score; // o recorde é atualizado com o valor do score
        }

        this.score = 0; // zerar o score de personagem
        this.gravidade = 1.6;

        velocidade = 6;
        faseAtual = 0;

    },

    pula: function(){
        if (this.qtdPulo < maxPulo){
            this.velocidade = - this.forcaDoPulo; // diminuir a velocidade conforme realizar o pulo, sendo que o eixo y recebe a velocidade a cada quadro.
            this.qtdPulo ++;
            
            somPulo.play();
        } 
    },

    // desenhar o personagem no contexto
    desenha: function(){
        //ctx.fillStyle = this.cor;
        //ctx.fillRect(this.x, this.y, this.largura, this.altura);

        // realizar a alteração do contexto para o centro apenas do bloco
        ctx.save();
        // operações para rotacionar
        ctx.translate(this.x + this.largura / 2, this.y + this.altura / 2); // centralizar o contexto ao bloco
        ctx.rotate(this.rotacao);
        spriteBoneco.desenha(-this.largura / 2, -this.altura / 2); // desenhando o personagem
        // restaurar as configurações padrões do contexto
        ctx.restore();
    },
},

// incluir obstaculos no contexto...
obstaculo = {
    _obs: [], // array principal com os obstaculos já inseridos no contexto
    //cores: ["#FAB300", "#C62828", "#9642B8", "#3B7BA7", "#4A8341"], // array com todas as possíveis corres
    _sprite: [redObstacle, pinkObstacle, blueObstacle, greenObstacle, yellowObstacle],
    tempoInsere: 0, // tempo de insersão de obstaculos
    _scored: false,

    // insere obstaculos novos aleatorios dentro do array _obs (sorteados)
    insere: function(){
        this._obs.push({
            x: LARGURA,
            // largura: 30 + Math.floor(21 * Math.random()), //caso queira utilizar um valor randomico na largura
            y: chao.y - Math.floor(20 + Math.random() * 100),
            //altura: 20 + Math.floor(100 * Math.random()),
            //cor: this.cores[Math.floor(5 * Math.random())],
            largura: 50,
            sprite: this._sprite[Math.floor(this._sprite.length * Math.random())],
        }); 

        this.tempoInsere = 30 + Math.floor(26 * Math.random()); // set de valor para tempo de insersão de obstaculos
    },

    // atualiza a posição x do obstaculo de acordo com a decrementação da velocidade
    atualiza: function(){
        if (this.tempoInsere == 0){
            this.insere();
        }else{
            this.tempoInsere --;
        }
        
        // laço de repetição FOR que atualiza todos os obstaculos inclusos de acordo com o tamanho do array
        for (var i = 0, tam = this._obs.length; i < tam; i ++) {
            var obs = this._obs[i];

            obs.x -= velocidade; // movimentação para a esquerda com a atualização do eixo x

        // teste de colição com os obstaculos
        // se o x do personagem for menor que o x do obstaculo + a largura, que coresponde a ponta direita.
        // se o x do personagem + a largura do personagem que coresponde a ponta direita for maior que o x do obstaculo.
        // se a altura do bloco for maior que o eixo y do chão - altura do obstaculo, que coresponde ao topo do obstaculo
            if (! bloco.colidindo && bloco.x <= obs.x + obs.largura && bloco.x + bloco.largura >= obs.x && bloco.y + bloco.altura >= obs.y){
                //estadoAtual = estados.perdeu;
                bloco.colidindo = true;
                setTimeout(function(){
                    bloco.colidindo = false;
                }, 500);

                if (bloco.vidas > 1){
                    bloco.vidas --;
                }else{
                    bloco.vidas --;
                    estadoAtual = estados.perdeu;
                }
                // armazenar o valor do recorde se o score atual for maior do que o recorde já guardado
                if (bloco.score > recorde){
                    localStorage.setItem("recorde", bloco.score); // pasar o valor do score para o localstorage
                    // recorde = bloco.score; // o recorde é atualizado com o valor do score
                }

            // quando o x do obstaculo chegar a 0 significa que o bloco do personagem pulou ele.
            }else if (obs.x <= 0 && ! obs._scored){
                bloco.score ++;
                obs._scored = true;
                if (faseAtual < pontosParaNovaFase.length && 
                    bloco.score == pontosParaNovaFase[faseAtual]){
                    passarDeFase();
                }
            // se o final da largura do obstaculo estiver no eixo x do canvas então remover ele do array
            } else if (obs.x <= - obs.largura){
                this._obs.splice(i, 1); // removendo elemento do array para não consumir memoria

                // atualizar os elementos devido removido do array para não parar o laço em FOR
                tam --; 
                i --;
            }
        }
    },

    // limpar o vetor quando perder o jogo
    limpa: function(){
        this._obs = [];
    },

    // desenha um novo obstaculo dentro do contexto, sendo que a partir dos valores aleatorios inclusos no array _obs ele as desenha na cor aleatoria inclusa no array cores.
    desenha: function(){
        for (var i = 0, tam = this._obs.length; i < tam; i ++){
            var obs = this._obs[i];
            //ctx.fillStyle = obs.cor;
            //ctx.fillRect(obs.x, chao.y - obs.altura, obs.largura, obs.altura);

            obs.sprite.desenha(obs.x, obs.y);
        }
    }
};


// funções
function clique(event){
    if (estadoAtual == estados.jogando){
        bloco.pula(); // realizar o metodo pula.
    } else if (estadoAtual == estados.jogar){
        estadoAtual = estados.jogando; // mudar para o estado de jogando.
    } else if (estadoAtual == estados.perdeu && bloco.y >= 2 * ALTURA){
        estadoAtual = estados.jogar; // mudar para estado de jogar.
        obstaculo.limpa(); // limpa por completo o array de obstaculos.
        bloco.reset(); // restaurar os valores do bloco.
    }
}

function passarDeFase(){
    velocidade ++;
    faseAtual ++;
    bloco.vidas ++;

    if (faseAtual == 4){
        bloco.gravidade *= 0.6;
    }

    labelNovaFase.texto = "Level " + faseAtual;
    labelNovaFase.fadeIn(0.4);
    setTimeout(function(){
        labelNovaFase.fadeOut(0.4);
    }, 800);
    
}

function main(){
    // pegar o tamanho da tela
    ALTURA = window.innerHeight; 
    LARGURA = window.innerWidth;

    // se o tamanho da tela for maior ou igual a 500 colocar o tamanho fixo de 600x600
    if (LARGURA >= 500) {
        LARGURA = 600;
        ALTURA = 600;
    }

    // criar o elemento canvas diretamente pelo JavaScript
    canvas = document.createElement("canvas");
    canvas.width = LARGURA;
    canvas.height = ALTURA;
    canvas.style.border = "0px solid #000";

    // colocar o contexto como 2d
    ctx = canvas.getContext("2d");

    // inserir o elemento canvas no html e escutar o clique "mousedown" e teclado "keydown"
    document.body.appendChild(canvas);
    document.addEventListener("mousedown", clique);
    document.addEventListener("keydown", function(e){
        console.log(e.key); // demontar a tecla pressionada no console
            if (e.key == ' '){
                clique();
            }
        });

    estadoAtual = estados.jogar // tela de inicio

    recorde = localStorage.getItem("recorde"); // atribuir o localStorage ao recorde
    if(recorde == null){
        recorde = 0; 
    }

    img = new Image();
    img.src = "imagens/sheet.png";

    roda(); // chamar o loop principal que atualiza os quadros e desenha as formas no contexto do canvas
    
}

function roda(){
    atualiza();
    desenha();

    window.requestAnimationFrame(roda); // loop principal do jogo
}

function atualiza(){
    //frames ++; // taxa de atualização dos frames

    bloco.atualiza(); // defini o chão e a atualização da velocidade e eixo y
    chao.atualiza();

    if (estadoAtual == estados.jogando){
        obstaculo.atualiza(); // remover obstaculos do array, controla o tempo para inserir obstaculos e atualiza o eixo x 
    }
}

function desenha(){
    //ctx.fillStyle = "#50beff";  // cor do canvas
    //ctx.fillRect(0, 0, LARGURA, ALTURA); // dimensoes do canvas
    bg.desenha(0, 0); // preenchimento do canvas

    if (estadoAtual == estados.jogando){
        obstaculo.desenha(); // instancia do obstaculo
    }

    bloco.desenha(); // instancia do personagem no contexto do canvas
    chao.desenha(); // instancia do chão no contexto do canvas


    ctx.fillStyle = "#FFF"; // cor do texto
    ctx.font = "50px Arial"; // fonte da letra no contexto
    ctx.fillText(bloco.score, 30, 68); // desenho de texto no contexto do canvas sendo que 38 é o padrão da altura
    ctx.fillText(bloco.vidas, 500, 68);

    ctx.fillStyle = "rgba(0, 0, 0, " + labelNovaFase.opacidade + ")";
    ctx.fillText(labelNovaFase.texto, canvas.width / 2 - ctx.measureText(labelNovaFase.texto).width / 2, canvas.height / 3);

    // desenhar as telas de estados do jogo:

    // se o estado atual for igual a jogar (tela inicial)
    if (estadoAtual == estados.jogar){

        //ctx.fillStyle = "green";
        //ctx.fillRect(LARGURA / 2 -50, ALTURA / 2 -50, 100, 100);
        jogar.desenha(LARGURA / 2 - jogar.largura / 2, ALTURA / 2 - jogar.altura / 2);

    // se o estado atual for igual a perdeu (tela de score)
    }else if (estadoAtual == estados.perdeu){
        //ctx.fillStyle = "red";
        //ctx.fillRect(LARGURA / 2 -50, ALTURA / 2 -50, 100, 100); 
        //ctx.save(); // salvar as configurações do contexto
        //ctx.translate(LARGURA / 2, ALTURA / 2);
        //ctx.fillStyle = "#fff";
        perdeu.desenha(LARGURA / 2 - perdeu.largura / 2, ALTURA / 2 - perdeu.altura / 2 - spriteRecord.altura / 2);
        spriteRecord.desenha(LARGURA / 2 - spriteRecord.largura / 2, ALTURA / 2 + perdeu.altura / 2 - spriteRecord.altura / 2 - 25);
        ctx.fillStyle = "#FFF"
        
 
        // se o score atual for maior que o recorde desenhar no contexto do canvas a mensagem de texto:
        if (bloco.score > recorde){
            //ctx.fillText("Novo Record!", -150, -65);
            
            novo.desenha(LARGURA / 2 - 180, ALTURA / 2 + 30);
            spriteRecord.desenha(LARGURA / 2 - spriteRecord.largura / 2, ALTURA / 2 + perdeu.altura / 2 - spriteRecord.altura / 2 - 25);
            
            ctx.fillText(bloco.score, 420, 470); 
         
        // se o score atual não for maior que o record e for < que 10 desenhar no contexto do canvas a mensagem de texto:
        //else if (recorde < 10){
            //ctx.fillText("Record " + recorde, -99, -65);

        //}
        // se o score atual não for maior que o record e for > que 10 desenhar no contexto do canvas a mensagem de texto:
        //else if (recorde >= 10 && recorde < 100){
            //ctx.fillText("Record " + recorde, -112, -65);

        }else{

            //ctx.fillText("Record " + recorde, -125, -65);
            ctx.fillText(bloco.score, 375, 390);
            ctx.fillText(localStorage.getItem("recorde"), 420, 470); 

        }

        //if (bloco.score < 10){
            //ctx.fillText(bloco.score, -13, 19); // desenho de texto no centro do canvas

        //} else if (bloco.score >= 10 && bloco.score < 100) {
            //ctx.fillText(bloco.score, -26, 19); // desenho de texto no centro do canvas

        //} else {
            //ctx.fillText(bloco.score, -39, 19); // desenho de texto no centro do canvas

        //}
    //ctx.restore(); // restaurar as configurações padrão do contexto
    }    
}

// inicializa a execução:
main();