$(document).ready(function () {

    // ==========================
    // LOGIN
    // ==========================
    if ($("#loginForm").length) {

        $("#loginForm").submit(function (e) {
            e.preventDefault();

            const email = $("#email").val().trim();
            const password = $("#password").val().trim();

            if (email === "" || password === "") {
                $("#alert-container").html(`
                    <div class="alert alert-danger">
                        Complete todos los campos.
                    </div>
                `);
                return;
            }

            $("#alert-container").html(`
                <div class="alert alert-success">
                    Inicio de sesión exitoso.
                </div>
            `);

            setTimeout(() => {
                window.location.href = "menu.html";
            }, 1500);
        });
    }

    // ==========================
    // MENU PRINCIPAL
    // ==========================

    if ($("#saldo").length) {
    
        let saldo = parseFloat(localStorage.getItem("saldo")) || 0;
    
        $("#saldo").text(`$${saldo.toLocaleString()}`);
    }

    if ($("#btnDepositar").length) {

        $("#btnDepositar").click(function () {

            $("#mensajeMenu").html(`
                <div class="alert alert-info">
                    Redirigiendo a Depósito
                </div>
            `);

            setTimeout(() => {
                window.location.href = "deposit.html";
            }, 1000);
        });

        $("#btnEnviarDinero").click(function () {

            $("#mensajeMenu").html(`
                <div class="alert alert-info">
                    Redirigiendo a Enviar Dinero
                </div>
            `);

            setTimeout(() => {
                window.location.href = "sendmoney.html";
            }, 1000);
        });

        $("#btnMovimientos").click(function () {

            $("#mensajeMenu").html(`
                <div class="alert alert-info">
                    Redirigiendo a Últimos Movimientos
                </div>
            `);

            setTimeout(() => {
                window.location.href = "transactions.html";
            }, 1000);
        });
    }

    // ==========================
    // DEPOSITO
    // ==========================
    if ($("#montoDepositar").length) {

        let saldo = parseFloat(localStorage.getItem("saldo")) || 0;

        $("#saldoActual").text(`$${saldo.toLocaleString()}`);

        $("#formDeposito").submit(function (e) {
            e.preventDefault();

            const monto = parseFloat($("#montoDepositar").val());

            if (isNaN(monto) || monto <= 0) {

                $("#alert-container").html(`
                    <div class="alert alert-danger">
                        Ingrese un monto válido.
                    </div>
                `);

                return;
            }

            saldo += monto;

            localStorage.setItem("saldo", saldo);

            let movimientos =
                JSON.parse(localStorage.getItem("movimientos")) || [];

            movimientos.unshift({
                tipo: "deposito",
                monto: monto,
                fecha: new Date().toLocaleDateString()
            });

            localStorage.setItem(
                "movimientos",
                JSON.stringify(movimientos)
            );

            $("#saldoActual").text(`$${saldo.toLocaleString()}`);

            $("#mensajeDeposito").html(`
                <p class="mt-3 text-success">
                    Has depositado: $${monto.toLocaleString()}
                </p>
            `);

            $("#alert-container").html(`
                <div class="alert alert-success">
                    Depósito realizado con éxito.
                </div>
            `);

            $("#montoDepositar").val("");

            setTimeout(() => {
                window.location.href = "menu.html";
            }, 2000);
        });
    }

    // ==========================
    // ENVIAR DINERO
    // ==========================
    if ($("#listaContactos").length) {

        $("#btnEnviarDinero").hide();

        $("#listaContactos").change(function () {
            $("#btnEnviarDinero").show();
        });

        if ($("#buscarContacto").length) {

            $("#buscarContacto").on("keyup", function () {

                let valor = $(this).val().toLowerCase();

                $("#listaContactos option").each(function () {

                    if ($(this).val() === "") return;

                    $(this).toggle(
                        $(this)
                            .text()
                            .toLowerCase()
                            .includes(valor)
                    );
                });
            });
        }

        $("#formAgregarContacto").submit(function (e) {
            e.preventDefault();

            const nombre = $("#nombre").val().trim();
            const alias = $("#alias").val().trim();
            const banco = $("#banco").val().trim();
            const cbu = $("#cbu").val().trim();

            if (
                nombre === "" ||
                alias === "" ||
                banco === "" ||
                cbu === ""
            ) {
                $("#mensajeContacto").html(`
                    <div class="alert alert-danger">
                        Complete todos los campos.
                    </div>
                `);
                return;
            }

            if (cbu.length !== 22 || isNaN(cbu)) {
                $("#mensajeContacto").html(`
                    <div class="alert alert-danger">
                        El CBU debe tener 22 dígitos.
                    </div>
                `);
                return;
            }

            $("#listaContactos").append(`
                <option value="${nombre}">
                    ${nombre} - ${alias}
                </option>
            `);
            $("#listaContactos").val(nombre).trigger("change");

            $("#mensajeContacto").html(`
                <div class="alert alert-success">
                    Contacto agregado correctamente.
                </div>
            `);

            this.reset();
            bootstrap.Modal.getInstance(
                document.getElementById("contactoModal")).hide();
        });

        $("#btnEnviarDinero").click(function () {

            const contacto = $("#listaContactos").val();
            const monto =
                parseFloat($("#montoEnviar").val()) || 0;

            let saldo =
                parseFloat(localStorage.getItem("saldo")) || 0;

            if (contacto === "") {
                return;
            }

            if (monto <= 0) {
                $("#mensajeTransferencia").html(`
                    <div class="alert alert-danger">
                        Ingrese un monto válido.
                    </div>
                `);
                return;
            }

            if (monto > saldo) {
                $("#mensajeTransferencia").html(`
                    <div class="alert alert-danger">
                        Saldo insuficiente.
                    </div>
                `);
                return;
            }

            saldo -= monto;

            localStorage.setItem("saldo", saldo);

            let movimientos =
                JSON.parse(localStorage.getItem("movimientos")) || [];

            movimientos.unshift({
                tipo: "transferencia",
                monto: monto,
                fecha: new Date().toLocaleDateString(),
                destinatario: contacto
            });

            localStorage.setItem(
                "movimientos",
                JSON.stringify(movimientos)
            );

            $("#mensajeTransferencia").html(`
                <div class="alert alert-success">
                    Envío realizado con éxito.
                </div>
            `);

            $("#montoEnviar").val("");

            setTimeout(() => {
                window.location.href = "menu.html";
            }, 2000);
        });
    }

    // ==========================
    // ULTIMOS MOVIMIENTOS
    // ==========================
    if ($("#listaMovimientos").length) {

        function getTipoTransaccion(tipo) {

            switch (tipo) {
                case "deposito":
                    return "Depósito";

                case "transferencia":
                    return "Transferencia";

                case "compra":
                    return "Compra";

                default:
                    return "Movimiento";
            }
        }

        function mostrarUltimosMovimientos(filtro = "todos") {

            $("#listaMovimientos").empty();

            let movimientos =
                JSON.parse(localStorage.getItem("movimientos")) || [];

            if (movimientos.length === 0) {
                $("#listaMovimientos").html(`
                    <li class="list-group-item">
                        No hay movimientos.
                    </li>
                `);
                return;
            }

            movimientos.forEach((mov) => {

                if (
                    filtro === "todos" ||
                    mov.tipo === filtro
                ) {
                    $("#listaMovimientos").append(`
                        <li class="list-group-item">
                            <strong>${getTipoTransaccion(
                                mov.tipo
                            )}</strong>
                            - $${mov.monto.toLocaleString()}
                            <br>
                            <small>${mov.fecha}</small>
                        </li>
                    `);
                }
            });
        }

        if (!localStorage.getItem("movimientos")) {
                const movimientosIniciales = [
                    {
                        tipo: "compra",
                        monto: 15000,
                        fecha: "03/07/2026"
                    },
                    {
                        tipo: "deposito",
                        monto: 30000,
                        fecha: "02/07/2026"
                    },
                    {
                        tipo: "transferencia",
                        monto: 5000,
                        fecha: "01/07/2026"
                    }
                ];

                localStorage.setItem(
                    "movimientos",
                    JSON.stringify(movimientosIniciales)
                );
            }

        
        mostrarUltimosMovimientos();

        $("#filtro").change(function () {
            mostrarUltimosMovimientos($(this).val());
        });
    }
});