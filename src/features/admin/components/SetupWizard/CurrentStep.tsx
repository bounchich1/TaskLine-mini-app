import type { SetupStepProps } from '@/features/admin/hooks/use-setup-wizard';

import { CompanyStep } from './CompanyStep';
import { DoneStep } from './DoneStep';
import { IndustryStep } from './IndustryStep';
import { ToneStep } from './ToneStep';
import { TopicsStep } from './TopicsStep';

export function CurrentStep(props: SetupStepProps) {
    switch (props.wizard.step) {
        case 0:
            return <IndustryStep {...props} />;
        case 1:
            return <CompanyStep {...props} />;
        case 2:
            return <TopicsStep {...props} />;
        case 3:
            return <ToneStep {...props} />;
        default:
            return <DoneStep {...props} />;
    }
}
