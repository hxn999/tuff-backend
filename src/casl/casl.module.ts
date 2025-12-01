import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory/casl-ability.factory';
import { AbilitiesGuard } from './abilities.guard';

@Module({
    providers:[CaslAbilityFactory,AbilitiesGuard],
    exports:[CaslAbilityFactory,AbilitiesGuard]
})
export class CaslModule {}
