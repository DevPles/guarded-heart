Modules: PCMSO, Atestados, Documentos, Signatures - tables and UI pages

## DB Tables Added
- pcmso_programas (empresa_id, responsavel_medico, crm, data_inicio, data_fim, versao, status)
- pcmso_exames_tipos (nome, categoria, validade_meses, exames_complementares)
- pcmso_eventos (colaborador_id, tipo, data_prevista, data_realizada, resultado)
- aso_documentos (pcmso_evento_id, tipo_aso, resultado, medico_nome, medico_crm)
- atestados (colaborador_id, cid, dias, data_inicio, tipo, status)
- documents (tipo_documento, titulo, data_emissao, validade, proximo_vencimento, status)
- document_versions (document_id, versao, arquivo_url, arquivo_hash)
- signatures (document_id, signer_name, sign_type, signed_at, status)
- responsaveis_tecnicos (nome, conselho, numero_registro, uf, especialidade)
- notification_user_settings (user_id, email_enabled, in_app_enabled, muted_types)

## Routes
- /pcmso - PCMSO management (programs + exams)
- /atestados - Atestados management
- /documentos - Documents, versions, signatures

## Notification Engine
- Also scans: EXAME_VENCIMENTO, DOCUMENTO_VENCIMENTO
