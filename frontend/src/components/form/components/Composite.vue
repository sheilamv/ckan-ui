<template>
    <v-col cols=12 class="py-2 mb-4">
        <label class="label">
            {{$tc(displayLabel)}}{{(field.required) ? '*' : ''}}&nbsp;
            <v-tooltip right v-if="field.help_text">
                <template v-slot:activator="{ on }">
                    <v-icon color="label_colour" v-on="on">mdi-help-circle-outline</v-icon>
                </template>
                <span>{{field.help_text}}</span>
            </v-tooltip>
        </label>
        <div v-if="!editing">
            <div class="mb-2">
                <div v-if="!hasDisplayed || !value.displayed">
                    <div v-for="(sub, key) in field.subfields" :key="field.field_name+'-'+key">
                        <v-row v-if="sub.display_snippet !== null" align="center">
                            <v-col cols=3 class="py-1">
                                <label class="sub-label">{{(sub.label !== '') ? $tc(sub.label) : $tc(sub.field_name)}}</label>
                            </v-col>
                            <v-col cols=9 class="py-1">
                                <span v-if="value">
                                    <span v-if="sub.display_snippet === 'url'">
                                        <a :href="value[sub.field_name]" style="text-overflow: ellipsis">{{value[sub.field_name]}}</a>
                                    </span>
                                    <span v-else-if="sub.field_name === 'email'">
                                        <a :href="'mailto:'+value[sub.field_name]">{{value[sub.field_name]}}</a>
                                    </span>
                                    <span v-else-if="sub.preset === 'select'" class="value">{{getDisplayValue(sub, value[sub.field_name])}}</span>
                                    <span v-else class="value">{{value[sub.field_name]}}</span>
                                </span>
                                <span v-else></span>
                            </v-col>
                        </v-row>
                    </div>
                </div>
            </div>
            <hr>
        </div>
        <div v-else :key="'composite'+field.field_name" class="mb-2">
            <v-row v-for="(sub, key) in field.subfields" :key="field.field_name+'-'+key" align="center">
                <v-col cols=2 class="pb-0">
                    <label class="sub-label">{{(sub.label !== '') ? $tc(sub.label) : $tc(sub.field_name)}}</label>
                </v-col>
                <v-col cols=10 class="pb-0">
                    <ValidationProvider v-if="sub.preset=='multiple_checkbox'" :rules="sub.required ? 'required' : ''" v-slot="{ errors }" :name="(sub.label !== '') ? $tc(sub.label) : $tc(sub.field_name)">
                        <v-checkbox
                            dense
                            class="mt-0"
                            :name="field.field_name+'.'+sub.field_name"
                            v-model="value[sub.field_name]"
                            :error-messages="errors.length > 0 ? [errors[0]] : []"
                            :disabled="disabled"
                            hide-details="auto"
                            @change="modified">
                        </v-checkbox>
                    </ValidationProvider>

                    <ValidationProvider v-else-if="sub.field_name==='org'" :rules="sub.required ? 'required' : ''" v-slot="{ errors }" :name="(sub.label !== '') ? $tc(sub.label) : $tc(sub.field_name)">
                        <v-select
                            :name="field.field_name+'.'+sub.field_name"
                            v-model="value[sub.field_name]"
                            :placeholder="sub.form_placeholder"
                            :items="orgArray"
                            item-text="label"
                            :disabled="disabled"
                            item-value="value"
                            outlined dense
                            hide-details="auto"
                            :error-messages="errors.length > 0 ? [errors[0]] : []"
                            @change="modified">
                        </v-select>
                    </ValidationProvider>

                    <ValidationProvider v-else-if="sub.preset==='select'" :rules="sub.required ? 'required' : ''" v-slot="{ errors }" :name="(sub.label !== '') ? $tc(sub.label) : $tc(sub.field_name)">
                        <v-select
                            :name="field.field_name+'.'+sub.field_name"
                            v-model="value[sub.field_name]"
                            :placeholder="sub.form_placeholder"
                            :items="sub.choices"
                            item-text="label"
                            item-value="value"
                            outlined dense
                            hide-details="auto"
                            :disabled="disabled"
                            :error-messages="errors.length > 0 ? [errors[0]] : []"
                            @change="modified">
                        </v-select>
                    </ValidationProvider>

                    <ValidationProvider v-else-if="field.field_name.toLowerCase().indexOf('date')>=0" :rules="(sub.required ? 'required|' : '') + 'date_format:yyyy-mm-dd'" v-slot="{ errors }" :name="(sub.label !== '') ? $tc(sub.label) : $tc(sub.field_name)">
                        <v-menu
                            :ref="field.field_name+'.'+sub.field_name"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                    outlined dense
                                    hide-details="auto"
                                    :name="field.field_name+'.'+sub.field_name"
                                    v-model="value[sub.field_name]"
                                    :placeholder="sub.form_placeholder"
                                    :error-messages="errors.length > 0 ? [errors[0]] : []"
                                    :disabled="disabled"
                                    readonly
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker :disabled="disabled" v-model="model[sub.field_name]" @input="modified(field.field_name+'.'+sub.field_name);"></v-date-picker>
                        </v-menu>
                    </ValidationProvider>

                    <ValidationProvider v-else-if="sub.field_name.toLowerCase().indexOf('email')>=0" :rules="(sub.required ? 'required|' : '') + 'email'" v-slot="{ errors }" :name="(sub.label !== '') ? $tc(sub.label) : $tc(sub.field_name)">
                        <v-text-field
                            outlined dense
                            hide-details="auto"
                            :name="field.field_name+'.'+sub.field_name"
                            v-model="value[sub.field_name]"
                            :placeholder="sub.form_placeholder"
                            :error-messages="errors.length > 0 ? [errors[0]] : []"
                            :disabled="disabled"
                            @input="modified">
                        </v-text-field>
                    </ValidationProvider>

                    <ValidationProvider v-else-if="sub.field_name.toLowerCase().indexOf('url')>=0" :rules="{required: !!sub.required, url: {require_tld: true, require_host: true}}" v-slot="{ errors }" :name="(sub.label !== '') ? $tc(sub.label) : $tc(sub.field_name)">
                        <v-text-field
                            outlined dense
                            hide-details="auto"
                            :name="field.field_name+'.'+sub.field_name"
                            v-model="value[sub.field_name]"
                            :placeholder="sub.form_placeholder"
                            :disabled="disabled"
                            :error-messages="errors.length > 0 ? [errors[0]] : []"
                            @input="modified">
                        </v-text-field>
                    </ValidationProvider>

                    <ValidationProvider v-else :rules="sub.required ? 'required' : ''" v-slot="{ errors }" :name="(sub.label !== '') ? $tc(sub.label) : $tc(sub.field_name)">
                        <v-text-field
                            outlined dense
                            hide-details="auto"
                            :name="field.field_name+'.'+sub.field_name"
                            v-model="value[sub.field_name]"
                            :placeholder="sub.form_placeholder"
                            :disabled="disabled"
                            :error-messages="errors.length > 0 ? [errors[0]] : []"
                            @input="modified">
                        </v-text-field>
                    </ValidationProvider>
                </v-col>
            </v-row>
        </div>
        <hr>
    </v-col>
</template>

<script>
export default {

    props: {
        field: Object,
        dataset: Object,
        value: {
            type: [Object, String],
            default: () => { return {}; }
        },
        editing: Boolean,
        scope: String,
        disabled: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            hasDisplayed: false,
            dateMenuOpen: false,
        }
    },
    methods: {
        addRecord: function() {
            let model = {}
            for (let i=0; i<this.field.subfields.length; i++){
                model[this.field.subfields[i].field_name] = "";
                if (this.field.subfields[i].field_name.toLowerCase() === "displayed"){
                    this.hasDisplayed = true;
                }
            }
            this.model.push(model);
        },
        removeRecord: function(index) {
            this.model.splice(index,1);
        },
        modified: function(refName) {
            if ( (typeof(refName) !== "undefined") && (typeof(this.$refs[refName]) !== "undefined") ){
                this.$refs[refName] = false;
            }
            this.$emit('edited', JSON.stringify(this.model));
        },
        getDisplayValue: function(field, value) {
            if (field.choices) {
                for (let choice of field.choices) {
                    if (choice.value === value) {
                        return choice.label;
                    }
                }
            }
            return value;
        }
    },
    watch: {
        value(){
            if (typeof(this.value) === "string"){
                this.value = {};
            }
        }
    },
    computed: {
        displayLabel: function(){
            return this.field.label + (this.editing && this.field.required ? '*' : '');
        }
    },
    mounted(){
        // if (this.dataset[this.field.field_name]){
        //     //THIS IS REQUIRED OR NOTHING WORKS FOR SOME REASON...:(
        //     this.model = JSON.parse(this.dataset[this.field.field_name]);
        //     this.$emit('edited', JSON.stringify(this.model));
        // }
    },
};
</script>

<style scoped>
    label.label{
        font-size: 16px;
        font-weight: bold;
        color: var(--v-faded_text-base);
    }
    label.sub-label{
        font-size: 16px;
        font-weight: bold;
        color: var(--v-faded_text-base);
    }
    .value{
        font-size: 16px;
        color: var(--v-faded_text-base);
    }
    hr{
        color: var(--v-icon-base);
        border-bottom: 0px;
    }
</style>
