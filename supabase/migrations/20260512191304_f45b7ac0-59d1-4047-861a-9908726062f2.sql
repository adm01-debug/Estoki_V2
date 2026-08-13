-- Adicionar posições para PP1 (Porta-Palete 1)
-- Seções A-E, Níveis 1-4
DO $$ 
DECLARE 
    secao TEXT;
    nivel INT;
BEGIN
    FOR secao IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E']) LOOP
        FOR nivel IN 1..4 LOOP
            INSERT INTO public.posicoes_estoque (codigo, tipo, status, zona, secao, nivel, porta_palete)
            VALUES (
                'PP1-' || secao || '-' || nivel, 
                'porta_palete', 
                'livre', 
                'ZONA-A', 
                secao, 
                nivel::text, 
                'PP1'
            )
            ON CONFLICT (codigo) DO NOTHING;
        END LOOP;
    END LOOP;

    -- PP2
    FOR secao IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E']) LOOP
        FOR nivel IN 1..4 LOOP
            INSERT INTO public.posicoes_estoque (codigo, tipo, status, zona, secao, nivel, porta_palete)
            VALUES (
                'PP2-' || secao || '-' || nivel, 
                'porta_palete', 
                'livre', 
                'ZONA-B', 
                secao, 
                nivel::text, 
                'PP2'
            )
            ON CONFLICT (codigo) DO NOTHING;
        END LOOP;
    END LOOP;

    -- PP3
    FOR secao IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E']) LOOP
        FOR nivel IN 1..4 LOOP
            INSERT INTO public.posicoes_estoque (codigo, tipo, status, zona, secao, nivel, porta_palete)
            VALUES (
                'PP3-' || secao || '-' || nivel, 
                'porta_palete', 
                'livre', 
                'ZONA-C', 
                secao, 
                nivel::text, 
                'PP3'
            )
            ON CONFLICT (codigo) DO NOTHING;
        END LOOP;
    END LOOP;

    -- Boxes de expedição (1-16)
    FOR i IN 1..16 LOOP
        INSERT INTO public.posicoes_estoque (codigo, tipo, status, zona, box)
        VALUES (
            'BOX-' || LPAD(i::text, 2, '0'), 
            'box', 
            'livre', 
            'EXPEDICAO', 
            LPAD(i::text, 2, '0')
        )
        ON CONFLICT (codigo) DO NOTHING;
    END LOOP;
END $$;