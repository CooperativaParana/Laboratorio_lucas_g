-- Base de datos para gestión apícola

-- 1. Tabla de Apicultor
CREATE TABLE apicultor (
    id_apicultor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Analista (movida antes de muestra para evitar referencia circular)
CREATE TABLE analista (
    id_analista SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Apiarios
CREATE TABLE apiarios (
    id_apiario SERIAL PRIMARY KEY,
    id_apicultor INTEGER NOT NULL REFERENCES apicultor(id_apicultor) ON DELETE CASCADE,
    nombre_apiario VARCHAR(100) NOT NULL,
    cant_colmenas INTEGER CHECK (cant_colmenas > 0),
    localidad VARCHAR(100) NOT NULL,
    latitud DECIMAL(10,8),  -- Más preciso que VARCHAR para coordenadas
    longitud DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Tambores
CREATE TABLE tambor (
    id_tambor SERIAL PRIMARY KEY,
    num_registro VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de relación Tambor-Apiario (N-N)
CREATE TABLE tambor_api (
    id_tambor INTEGER NOT NULL REFERENCES tambor(id_tambor) ON DELETE CASCADE,
    id_apiario INTEGER NOT NULL REFERENCES apiarios(id_apiario) ON DELETE CASCADE,
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (id_tambor, id_apiario)
);

-- 6. Tabla de Especies
CREATE TABLE especies (
    id_especie SERIAL PRIMARY KEY,
    nombre_cientifico VARCHAR(150) NOT NULL UNIQUE,  -- Renombrado y único
    nombre_comun VARCHAR(100),  -- Renombrado para mayor claridad
    familia VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Muestras
CREATE TABLE muestra (
    id_muestra SERIAL PRIMARY KEY,
    id_analista INTEGER NOT NULL REFERENCES analista(id_analista) ON DELETE RESTRICT,
    fecha_extraccion DATE NOT NULL,
    fecha_analisis DATE,
    num_registro VARCHAR(50) UNIQUE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Constraint para validar que fecha_analisis >= fecha_extraccion
    CONSTRAINT chk_fechas_muestra CHECK (fecha_analisis IS NULL OR fecha_analisis >= fecha_extraccion)
);

-- 8. Tabla de relación Muestra-Tambor (N-N)
CREATE TABLE muestra_tambor (
    id_muestra INTEGER NOT NULL REFERENCES muestra(id_muestra) ON DELETE CASCADE,
    id_tambor INTEGER NOT NULL REFERENCES tambor(id_tambor) ON DELETE CASCADE,
    fecha_asociacion DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (id_muestra, id_tambor)
);

-- 9. Tabla de Análisis Palinológico
CREATE TABLE analisis_palinologico (
    id_palinologico SERIAL PRIMARY KEY,
    id_muestra INTEGER NOT NULL REFERENCES muestra(id_muestra) ON DELETE CASCADE,
    id_especie INTEGER NOT NULL REFERENCES especies(id_especie) ON DELETE RESTRICT,
    cantidad_granos INTEGER NOT NULL CHECK (cantidad_granos >= 0),
    marca_especial VARCHAR(10) CHECK (marca_especial IN ('x', '#', '##')),
    porcentaje DECIMAL(5,2) CHECK (porcentaje >= 0 AND porcentaje <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_muestra, id_especie)
);

-- 10. Tabla de Análisis Fisico-Quimicos
CREATE TABLE analisis_fisicoquimicos (
    id_fisqui SERIAL PRIMARY KEY,
    id_analista INTEGER NOT NULL REFERENCES analista(id_analista) ON DELETE RESTRICT,
    id_tambor INTEGER NOT NULL REFERENCES tambor(id_tambor) ON DELETE CASCADE,
    color INT,
    Humedad DECIMAL(5,2),
    fecha_extraccion DATE NOT NULL,
    fecha_analisis DATE,
    num_registro VARCHAR(50) UNIQUE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Índices para mejorar performance
CREATE INDEX idx_apiarios_apicultor ON apiarios(id_apicultor);
CREATE INDEX idx_muestra_analista ON muestra(id_analista);
CREATE INDEX idx_muestra_fechas ON muestra(fecha_extraccion, fecha_analisis);
CREATE INDEX idx_analisis_muestra ON analisis_palinologico(id_muestra);
CREATE INDEX idx_analisis_especie ON analisis_palinologico(id_especie);
CREATE INDEX idx_especies_nombre ON especies(nombre_cientifico);
CREATE INDEX idx_analista_username ON analista(username);
CREATE INDEX idx_analista_email ON analista(email);
CREATE INDEX idx_analista_active ON analista(is_active);

-- Comentarios para documentar las tablas
COMMENT ON TABLE apicultor IS 'Apicultores de apiarios';
COMMENT ON TABLE analista IS 'Especialistas que realizan análisis';
COMMENT ON TABLE apiarios IS 'Ubicaciones de colmenas';
COMMENT ON TABLE tambor IS 'Contenedores de miel';
COMMENT ON TABLE tambor_api IS 'Relación entre tambores y apiarios';
COMMENT ON TABLE especies IS 'Especies de plantas para análisis palinológico';
COMMENT ON TABLE muestra IS 'Muestras de miel para análisis';
COMMENT ON TABLE muestra_tambor IS 'Relación entre muestras y tambores';
COMMENT ON TABLE analisis_palinologico IS 'Resultados del análisis palinológico de muestras';