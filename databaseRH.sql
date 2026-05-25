CREATE DATABASE IF NOT EXISTS sistema_rh
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
 
USE sistema_rh;
 
CREATE TABLE tb_departamentos (
    id_departamento INT          NOT NULL AUTO_INCREMENT,
    nome            VARCHAR(80)  NOT NULL,
    sigla           VARCHAR(10)  NOT NULL,
    descricao       TEXT,
    id_responsavel  INT,
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_departamentos PRIMARY KEY (id_departamento),
    CONSTRAINT uq_sigla         UNIQUE (sigla)
);
 
CREATE TABLE tb_usuarios_admin (
    id_usuario      INT          NOT NULL AUTO_INCREMENT,
    nome            VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL,
    senha_hash      VARCHAR(255) NOT NULL,
    perfil          ENUM('super_admin','admin','rh','financeiro','gestor') NOT NULL DEFAULT 'rh',
    id_departamento INT,
    id_funcionario  INT,
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_acesso   TIMESTAMP,
    token_reset     VARCHAR(255),
    token_expira_em TIMESTAMP,
    criado_em       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_usuarios      PRIMARY KEY (id_usuario),
    CONSTRAINT uq_email_usuario UNIQUE (email),
    CONSTRAINT fk_usuario_depto FOREIGN KEY (id_departamento)
        REFERENCES tb_departamentos (id_departamento)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
 
CREATE TABLE tb_cargos (
    id_cargo        INT          NOT NULL AUTO_INCREMENT,
    nome_cargo      VARCHAR(80)  NOT NULL,
    id_departamento INT          NOT NULL,
    nivel           ENUM('junior','pleno','senior','especialista','gestor') NOT NULL DEFAULT 'pleno',
    salario_minimo  DECIMAL(10,2) NOT NULL,
    salario_maximo  DECIMAL(10,2) NOT NULL,
    descricao       TEXT,
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_cargos      PRIMARY KEY (id_cargo),
    CONSTRAINT fk_cargo_depto FOREIGN KEY (id_departamento)
        REFERENCES tb_departamentos (id_departamento)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_faixa_sal  CHECK (salario_maximo >= salario_minimo)
);
 
CREATE TABLE tb_funcionarios (
    id_funcionario  INT          NOT NULL AUTO_INCREMENT,
    nome_completo   VARCHAR(100) NOT NULL,
    cpf             CHAR(11)     NOT NULL,
    rg              VARCHAR(20),
    email           VARCHAR(100) NOT NULL,
    telefone        VARCHAR(15),
    data_nascimento DATE,
    data_admissao   DATE         NOT NULL,
    data_demissao   DATE,
    id_cargo        INT          NOT NULL,
    salario_base    DECIMAL(10,2) NOT NULL,
    situacao        ENUM('ativo','ferias','afastado','demitido') NOT NULL DEFAULT 'ativo',
    criado_em       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_funcionarios  PRIMARY KEY (id_funcionario),
    CONSTRAINT uq_cpf           UNIQUE (cpf),
    CONSTRAINT uq_email         UNIQUE (email),
    CONSTRAINT fk_func_cargo    FOREIGN KEY (id_cargo)
        REFERENCES tb_cargos (id_cargo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_sal_positivo CHECK (salario_base > 0),
    CONSTRAINT chk_datas_func   CHECK (data_demissao IS NULL OR data_demissao >= data_admissao)
);
 
ALTER TABLE tb_departamentos
    ADD CONSTRAINT fk_depto_responsavel FOREIGN KEY (id_responsavel)
        REFERENCES tb_funcionarios (id_funcionario)
        ON UPDATE CASCADE
        ON DELETE SET NULL;
 
ALTER TABLE tb_usuarios_admin
    ADD CONSTRAINT fk_usuario_func FOREIGN KEY (id_funcionario)
        REFERENCES tb_funcionarios (id_funcionario)
        ON UPDATE CASCADE
        ON DELETE SET NULL;
 
CREATE TABLE tb_folha_pagamento (
    id_folha         INT          NOT NULL AUTO_INCREMENT,
    id_funcionario   INT          NOT NULL,
    mes_referencia   DATE         NOT NULL,
    salario_bruto    DECIMAL(10,2) NOT NULL,
    desconto_inss    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    desconto_irrf    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    outros_descontos DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    bonus            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    salario_liquido  DECIMAL(10,2) NOT NULL,
    data_pagamento   DATE,
    status_pagamento ENUM('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
    observacao       VARCHAR(255),
    criado_em        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_folha      PRIMARY KEY (id_folha),
    CONSTRAINT uq_folha_mes  UNIQUE (id_funcionario, mes_referencia),
    CONSTRAINT fk_folha_func FOREIGN KEY (id_funcionario)
        REFERENCES tb_funcionarios (id_funcionario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_sal_liquido CHECK (salario_liquido >= 0),
    CONSTRAINT chk_descontos   CHECK (
        desconto_inss >= 0 AND
        desconto_irrf >= 0 AND
        outros_descontos >= 0 AND
        bonus >= 0
    )
);
 
CREATE TABLE tb_ferias (
    id_ferias        INT          NOT NULL AUTO_INCREMENT,
    id_funcionario   INT          NOT NULL,
    data_inicio      DATE         NOT NULL,
    data_fim         DATE         NOT NULL,
    dias_gozados     INT          NOT NULL,
    abono_pecuniario BOOLEAN      NOT NULL DEFAULT FALSE,
    valor_ferias     DECIMAL(10,2),
    status           ENUM('agendada','em gozo','concluida','cancelada') NOT NULL DEFAULT 'agendada',
    aprovado_por     INT,
    data_aprovacao   DATE,
    observacao       VARCHAR(255),
    criado_em        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_ferias           PRIMARY KEY (id_ferias),
    CONSTRAINT fk_ferias_func      FOREIGN KEY (id_funcionario)
        REFERENCES tb_funcionarios (id_funcionario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_ferias_aprovador FOREIGN KEY (aprovado_por)
        REFERENCES tb_funcionarios (id_funcionario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_periodo_ferias  CHECK (data_fim >= data_inicio),
    CONSTRAINT chk_dias_ferias     CHECK (dias_gozados BETWEEN 5 AND 30)
);
 
CREATE TABLE tb_controle_ponto (
    id_registro       INT          NOT NULL AUTO_INCREMENT,
    id_funcionario    INT          NOT NULL,
    data              DATE         NOT NULL,
    entrada           TIME,
    saida_almoco      TIME,
    retorno_almoco    TIME,
    saida             TIME,
    horas_trabalhadas DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    horas_extras      DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    ocorrencia        ENUM('normal','atraso','falta','falta justificada','folga','feriado') NOT NULL DEFAULT 'normal',
    justificativa     VARCHAR(255),
    criado_em         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_ponto      PRIMARY KEY (id_registro),
    CONSTRAINT uq_ponto_dia  UNIQUE (id_funcionario, data),
    CONSTRAINT fk_ponto_func FOREIGN KEY (id_funcionario)
        REFERENCES tb_funcionarios (id_funcionario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_horas_pos CHECK (horas_trabalhadas >= 0 AND horas_extras >= 0)
);
 
CREATE INDEX idx_func_situacao   ON tb_funcionarios    (situacao);
CREATE INDEX idx_func_cargo      ON tb_funcionarios    (id_cargo);
CREATE INDEX idx_folha_mes       ON tb_folha_pagamento (mes_referencia);
CREATE INDEX idx_folha_status    ON tb_folha_pagamento (status_pagamento);
CREATE INDEX idx_ferias_status   ON tb_ferias          (status);
CREATE INDEX idx_ferias_periodo  ON tb_ferias          (data_inicio, data_fim);
CREATE INDEX idx_ponto_data      ON tb_controle_ponto  (data);
CREATE INDEX idx_ponto_ocorrencia ON tb_controle_ponto (ocorrencia);
CREATE INDEX idx_depto_ativo     ON tb_departamentos   (ativo);
CREATE INDEX idx_usuario_perfil  ON tb_usuarios_admin  (perfil);
CREATE INDEX idx_usuario_ativo   ON tb_usuarios_admin  (ativo);