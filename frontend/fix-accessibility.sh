#!/bin/bash

# Script para adicionar role="alert" em todos os alerts

find src/modules -name "*.vue" -type f -exec sed -i 's/class="alert alert-error">/class="alert alert-error" role="alert">/g' {} \;
find src/modules -name "*.vue" -type f -exec sed -i 's/class="alert alert-success">/class="alert alert-success" role="alert">/g' {} \;
find src/modules -name "*.vue" -type f -exec sed -i 's/class="alert alert-warning">/class="alert alert-warning" role="alert">/g' {} \;

echo "Role alert adicionado em todos os componentes de alerta!"
