-- ============================================
-- POLÍTICAS RLS PARA LA TABLA carrito
-- ============================================

-- Habilitar RLS en la tabla carrito
ALTER TABLE carrito ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio carrito
-- carrito.id_usuario es UUID que referencia directamente a usuario.id_propietario
-- Por lo tanto: carrito.id_usuario = usuario.id_propietario = auth.uid()
CREATE POLICY "Usuarios pueden ver su propio carrito"
ON carrito
FOR SELECT
USING (
  id_usuario = auth.uid()
);

-- Política: Los usuarios pueden insertar items en su propio carrito
CREATE POLICY "Usuarios pueden agregar a su propio carrito"
ON carrito
FOR INSERT
WITH CHECK (
  id_usuario = auth.uid()
);

-- Política: Los usuarios pueden actualizar su propio carrito
CREATE POLICY "Usuarios pueden actualizar su propio carrito"
ON carrito
FOR UPDATE
USING (
  id_usuario = auth.uid()
)
WITH CHECK (
  id_usuario = auth.uid()
);

-- Política: Los usuarios pueden eliminar items de su propio carrito
CREATE POLICY "Usuarios pueden eliminar de su propio carrito"
ON carrito
FOR DELETE
USING (
  id_usuario = auth.uid()
);

-- ============================================
-- POLÍTICAS RLS PARA LA TABLA pedido
-- ============================================

-- Habilitar RLS en la tabla pedido
ALTER TABLE pedido ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propios pedidos
-- pedido.id_usuario es UUID que referencia directamente a usuario.id_propietario
-- Por lo tanto: pedido.id_usuario = usuario.id_propietario = auth.uid()
CREATE POLICY "Usuarios pueden ver sus propios pedidos"
ON pedido
FOR SELECT
USING (
  id_usuario = auth.uid()
);

-- Política: Los tienderos pueden ver pedidos de sus tiendas
-- Verificamos que tienda.id_propietario = auth.uid()
-- tienda.id_propietario referencia a usuario.id_propietario
CREATE POLICY "Tienderos pueden ver pedidos de sus tiendas"
ON pedido
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tienda
    WHERE tienda.id_tienda = pedido.id_tienda
    AND tienda.id_propietario = auth.uid()
  )
);

-- Política: Los usuarios pueden crear pedidos
-- pedido.id_usuario es UUID que referencia directamente a usuario.id_propietario
CREATE POLICY "Usuarios pueden crear pedidos"
ON pedido
FOR INSERT
WITH CHECK (
  id_usuario = auth.uid()
);

-- Política: Los usuarios pueden actualizar sus propios pedidos (solo si están pendientes)
-- pedido.id_usuario es UUID que referencia directamente a usuario.id_propietario
CREATE POLICY "Usuarios pueden actualizar sus pedidos pendientes"
ON pedido
FOR UPDATE
USING (
  id_usuario = auth.uid()
  AND estado = 'pendiente'
)
WITH CHECK (
  id_usuario = auth.uid()
  AND estado = 'pendiente'
);

-- Política: Los tienderos pueden actualizar pedidos de sus tiendas (para cambiar estado)
-- Verificamos que tienda.id_propietario = auth.uid()
-- tienda.id_propietario referencia a usuario.id_propietario
CREATE POLICY "Tienderos pueden actualizar pedidos de sus tiendas"
ON pedido
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tienda
    WHERE tienda.id_tienda = pedido.id_tienda
    AND tienda.id_propietario = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tienda
    WHERE tienda.id_tienda = pedido.id_tienda
    AND tienda.id_propietario = auth.uid()
  )
);

-- Política: Los usuarios pueden eliminar sus propios pedidos (solo si están pendientes)
-- pedido.id_usuario es UUID que referencia directamente a usuario.id_propietario
CREATE POLICY "Usuarios pueden eliminar sus pedidos pendientes"
ON pedido
FOR DELETE
USING (
  id_usuario = auth.uid()
  AND estado = 'pendiente'
);

-- ============================================
-- POLÍTICAS RLS PARA LA TABLA direcciones_usuario
-- ============================================

-- Habilitar RLS en la tabla direcciones_usuario
ALTER TABLE direcciones_usuario ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias direcciones
-- direcciones_usuario.id_usuario es UUID que referencia a usuario.id_propietario
CREATE POLICY "Usuarios pueden ver sus propias direcciones"
ON direcciones_usuario
FOR SELECT
USING (
  id_usuario = auth.uid()
);

-- Política: Los usuarios pueden crear direcciones
CREATE POLICY "Usuarios pueden crear direcciones"
ON direcciones_usuario
FOR INSERT
WITH CHECK (
  id_usuario = auth.uid()
);

-- Política: Los usuarios pueden actualizar sus propias direcciones
CREATE POLICY "Usuarios pueden actualizar sus direcciones"
ON direcciones_usuario
FOR UPDATE
USING (
  id_usuario = auth.uid()
)
WITH CHECK (
  id_usuario = auth.uid()
);

-- Política: Los usuarios pueden eliminar sus propias direcciones
CREATE POLICY "Usuarios pueden eliminar sus direcciones"
ON direcciones_usuario
FOR DELETE
USING (
  id_usuario = auth.uid()
);

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. usuario.id_propietario = auth.uid() (UUID del usuario autenticado)
-- 2. carrito.id_usuario es UUID que debe ser igual a usuario.id_propietario (auth.uid())
-- 3. pedido.id_usuario es UUID que referencia directamente a usuario.id_propietario (auth.uid())
-- 4. tienda.id_propietario también referencia a usuario.id_propietario (UUID)
-- 5. Todas las políticas verifican que usuario.id_propietario = auth.uid()
-- 6. Si necesitas ajustar las políticas, puedes hacerlo desde el dashboard de Supabase
--    en: Authentication > Policies > [nombre de la tabla]
-- ============================================

