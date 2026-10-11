// Elementos da tela
const abaEntrar = document.querySelector("#aba-entrar");
const abaCriar = document.querySelector("#aba-criar");
const formEntrar = document.querySelector("#form-entrar");
const formCriar = document.querySelector("#form-criar");
const linkCriar = document.querySelector("#link-criar");
const linkEntrar = document.querySelector("#link-entrar");

abaEntrar.addEventListener("click", function () {
    mostrarAba("entrar");
});

abaCriar.addEventListener("click", function () {
    mostrarAba("criar");
});

linkCriar.addEventListener("click", function (event) {
    event.preventDefault();
    mostrarAba("criar");
});

linkEntrar.addEventListener("click", function (event) {
    event.preventDefault();
    mostrarAba("entrar");
});

/* ------- FUNLÇOES AUXILIARES ------- */

function mostrarAba(aba) {
    const entrarAtivo = aba === "entrar";

    formEntrar.hidden = !entrarAtivo;
    formCriar.hidden = entrarAtivo;

    if (entrarAtivo) {
        abaEntrar.classList.add("ativa");
        abaEntrar.setAttribute("aria-selected", "true");
        abaCriar.classList.remove("ativa");
        abaCriar.setAttribute("aria-selected", "false");
    } else {
        abaCriar.classList.add("ativa");
        abaCriar.setAttribute("aria-selected", "true");
        abaEntrar.classList.remove("ativa");
        abaEntrar.setAttribute("aria-selected", "false");
    }
}