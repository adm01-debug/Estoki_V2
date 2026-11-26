import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { montarAlertas, severidadeDe, mapaDeRegras, type ProdutoComEstoque, type RegraAlerta } from "./alertas.ts";

const produto = (over: Partial<ProdutoComEstoque> = {}): ProdutoComEstoque => ({
  id: "p1",
  sku: "SKU-1",
  nome: "Produto 1",
  estoque_minimo: 10,
  estoque_maximo: null,
  ponto_pedido: 20,
  estoque_atual: 5,
  ...over,
});

const regra = (over: Partial<RegraAlerta> = {}): RegraAlerta => ({
  tipo: "estoque_minimo",
  ativo: true,
  threshold_valor: null,
  threshold_dias: null,
  severidade: "critico",
  ...over,
});

Deno.test("gera alerta de estoque minimo abaixo do minimo", () => {
  const alertas = montarAlertas([produto()], [regra()]);
  assertEquals(alertas.length, 1);
  assertEquals(alertas[0].tipo, "estoque_minimo");
  assertEquals(alertas[0].severidade, "critico");
});

Deno.test("regra desativada na config nao gera alerta daquele tipo", () => {
  const alertas = montarAlertas([produto()], [regra({ ativo: false })]);
  assertEquals(alertas.length, 0);
});

Deno.test("sem configuracao o alerta continua sendo gerado", () => {
  assertEquals(montarAlertas([produto()], []).length, 1);
  assertEquals(montarAlertas([produto()], null).length, 1);
});

Deno.test("severidade vem da configuracao e cai no padrao quando ausente", () => {
  const mapa = mapaDeRegras([regra({ severidade: "urgente" })]);
  assertEquals(severidadeDe(mapa, "estoque_minimo"), "urgente");
  assertEquals(severidadeDe(mapa, "ponto_pedido"), "aviso");
  assertEquals(severidadeDe(mapaDeRegras([regra({ severidade: "desconhecida" })]), "estoque_minimo"), "critico");
});

Deno.test("ponto de pedido so alerta entre o minimo e o ponto", () => {
  const dentro = montarAlertas([produto({ estoque_atual: 15 })], [regra({ tipo: "ponto_pedido" })]);
  assertEquals(dentro.map((a) => a.tipo), ["ponto_pedido"]);
  const acima = montarAlertas([produto({ estoque_atual: 30 })], [regra({ tipo: "ponto_pedido" })]);
  assertEquals(acima.length, 0);
});

Deno.test("estoque acima do maximo gera alerta quando ha maximo definido", () => {
  const alertas = montarAlertas([produto({ estoque_atual: 50, estoque_maximo: 40 })], [regra({ tipo: "estoque_maximo" })]);
  assertEquals(alertas.map((a) => a.tipo), ["estoque_maximo"]);
});
