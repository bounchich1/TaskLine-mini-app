import { Button } from '@maxhub/max-ui';

import { TEMPLATE_INFO } from '@/features/admin/model/template-catalog';
import type { Template } from '@/features/admin/model/types';

export function TemplateRow({ template, onEdit }: { template: Template; onEdit: () => void }) {
    const info = TEMPLATE_INFO[template.code];
    const customized = template.default_body !== null && template.body !== template.default_body;

    return (
        <div className="template-row">
            <div className="template-row__main">
                <strong className="template-row__title">
                    {info?.title ?? template.code}
                    {customized ? <span className="template-row__badge">изменено</span> : null}
                </strong>

                <small className="template-row__when">{info?.when ?? template.code}</small>
                <p className="template-row__body">{template.body}</p>
            </div>

            <Button
                variant="secondary"
                size="xsmall"
                aria-label={`Изменить «${info?.title ?? template.code}»`}
                onClick={onEdit}
            >
                Изменить
            </Button>
        </div>
    );
}
