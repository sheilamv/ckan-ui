import { CkanApi } from '../../services/ckanApi';
const ckanServ = new CkanApi();

import { ResourceApi } from '../../services/resourceApi';
const resourceServ = new ResourceApi();

import Vue from 'vue';

const state = {
    dataset: {},
    resourceUpdate: false,
    shouldAbort: false,
    unmodifiedDataset: {},
    schemas: {},
    schemaLoading: false,
    dataLoading: false,
    resources: {},
    error: null
};

const actions = {
    getDataset({ commit, dispatch }, { id }) {
        commit('setResetAbort');
        commit('clearError');
        commit('setDataLoading', {dataLoading: true});
        commit('setSchemaLoading', {schemaLoading: true});
        ckanServ.getDataset(id).then((data) => {
            if (data.success) {
                if(data.result == undefined) {
                    commit('abortDataset')
                } else {
                    commit('setCurrentDataset', { dataset: data.result });
                    commit('setDataLoading', {dataLoading: false});
                    dispatch('getDatasetSchema').then(() => {
                        commit('setSchemaLoading', {schemaLoading: false});
                    });
                }
            } else {
                // eslint-disable-next-line
                console.log("catch 1")
                commit('setError', {error: data.error});
                commit('setSchemaLoading', {schemaLoading: false});
                commit('setDataLoading', {dataLoading: false});
            }
        }).catch((e) => {
            // eslint-disable-next-line
            console.log("catch 2: " + e)
            commit('setError', {error: e});
            commit('setSchemaLoading', {schemaLoading: false});
            commit('setDataLoading', {dataLoading: false});
        });
    },

    getDatasetSchema(context){
        context.commit('clearError');
        let type = 'bcdc_dataset';
        if (typeof(context.state.schemas[type]) !== "undefined"){
            context.commit('setSchema', {type: type, data: context.state.schemas[type]});
            return context.state.schemas[type];
        }
        ckanServ.getDatasetSchema(type).then((data) => {
            if ((typeof(data.success) !== "undefined") && (data.success === true) && (typeof(data.result) !== "undefined")){
                context.commit('setSchema', {type: type, data: data.result});
                return data.result;
            }
            context.commit('setError', {error: data.error});
            // eslint-disable-next-line
            console.error("error fetching schema type", data);
            return {};

        });
    },
    //getResource(context, {datasetResourceIndex, id}){
    getResource(context, {id}){
        if ( (typeof(context.state.resources[id]) !== "undefined") && (context.state.resource[id] !== null) ){
            return context.state.resources[id];
        }

        resourceServ.getResource(id).then(async(data) => {
            data.metadata = data
            // var getResourceSchema = async function(resource, headers, data){
            //     const Schema = require('jsontableschema').Schema;
            //     var infer = require('jsontableschema').infer;
            
            //     let s = null;
            //     if (resource && resource.json_table_schema){
            //         s = resource.json_table_schema;
            //         let model = await new Schema(s);
            //         return model;
            //     }else if (headers.length>0 && data.length>0){
            //         let options = {
            //             rowLimit: 2,
            //         };
            //         s = await infer(headers, data, options);
            //         return s;
            //     }
            // }
            // resource.type = "unknown";
            // resource.schema = null;
            // resource.hasSchema = true;
            // resource.schemaError = null;

            // if ( (data.status === 404) || (data.status === 500) || (data.status === 401) || (data.status === 403) ){
            //     resource.type = "404";

            // }else if (data['type'] === 'xls'){
            //     resource.type = 'xls';

            // }else if (data.headers) {
            //     resource.type = "csv";
            //     resource.data = data.workbook
            //     resource.headers = data.headers
            //     if (!context.state.dataset.resources[datasetResourceIndex].json_table_schema){
            //         try {
            //             let s = await getResourceSchema(null, resource.headers, resource.data);
            //             resource.schema = s;
            //             resource.schemaInferred = true;
            //             resource.metadata = data.metadata;
            //             context.commit('setResource', {id: id, resource: resource});
            //         }catch (e) {
            //             resource.schema = null;
            //             resource.schemaInferred = false;
            //             resource.schemaError = e[0];
            //             resource.metadata = data.metadata;
            //             context.commit('setResource', {id: id, resource: resource});
            //         }
            //     }
            // }else if (data['content-type'] === "application/pdf"){
            //     resource.type = "pdf";
            //     resource.url = data.origUrl;
            //     resource.raw_data = btoa(unescape(encodeURIComponent(data.raw_data)));
            // } else {
            //     resource.raw_data = data.raw_data;
            //     if (!resource.raw_data || resource.raw_data.indexOf("404 Not Found") !== -1){
            //         resource.hasSchema = false;
            //     }
            // }

            // if ( (resource.schema === null) && (context.state.dataset.resources[datasetResourceIndex].json_table_schema)){
            //     try{
            //         let s = await getResourceSchema(context.state.dataset.resources[datasetResourceIndex], [], []);
            //         resource.schema = s;
            //         resource.schemaInferred = false;
            //         resource.metadata = data.metadata;
            //         context.commit('setResource', {id: id, resource: resource});
            //     }catch(e){
            //         resource.schema = null;
            //         resource.schemaError = e[0];
            //         resource.schemaInferred = false;
            //         resource.metadata = data.metadata;
            //         context.commit('setResource', {id: id, resource: resource});
            //     }
            // } else {
            //     resource.schema = null;
            //     resource.schemaInferred = false;
            //     resource.metadata = data.metadata;
            //     context.commit('setResource', {id: id, resource: resource});
            // }

            context.commit('setResource', {id: id, resource: data});
        });
    },

    setDataset({ state }) {
        let dataset = JSON.parse(JSON.stringify(state.dataset));
        delete dataset.resources;
        return ckanServ.putDataset(dataset);
    },
    createDataset({ state }) {
        return ckanServ.postDataset(state.dataset);
    },
    addContact({ commit }) {
        commit('setAddContact');
    },
    removeContact({ commit }, { index }) {
        commit('setRemoveContact', {index: index});
    },
    addMoreInfo({ commit }) {
        commit('setAddMoreInfo');
    },
    removeMoreInfo({ commit }, { index }) {
        commit('setRemoveMoreInfo', {index: index});
    },
    addDate({ commit }) {
        commit('setAddDate');
    },
    removeDate({ commit }, { index }) {
        commit('setRemoveDate', {index: index});
    },
    resetDataset({ commit }) {
        commit('resetDataset');
    }
};

const mutations = {
    setResetAbort(state) {
        state.shouldAbort = false;
    },
    setDataLoading(state, {dataLoading}){
        state.dataLoading = dataLoading;
    },
    clearDataset(state){
        //state.dataset = {};
        Vue.set(state, 'dataset', {});
        state.dataLoading = false;
        state.shouldAbort = false;
    },
    setSchemaLoading(state, {schemaLoading}) {
        state.schemaLoading = schemaLoading;
    },
    setResource(state, {id, resource}){
        Vue.set(state.resources, id, resource);
    },
    setCurrentDataset(state, { dataset }) {
        state.dataset = Object.assign({}, dataset);
        state.unmodifiedDataset = Object.assign({}, dataset);
    },
    setCurrentNotUnmod(state, {dataset}) {
        state.dataset = Object.assign({}, dataset);
    },
    setSchema(state, {type, data}){
        state.schemas[type] = Object.assign({}, data);
    },
    setAddContact(state) {
        state.dataset.contacts.push({
            name: '',
            email: '',
            organization: '',
            branch: '',
            role: '',
            private: 'Private'
        });
    },
    setRemoveContact(state, { index }) {
        state.dataset.contacts.splice(index, 1);
    },
    setAddMoreInfo(state) {
        state.dataset.more_info.push({
            delete: '0',
            link: ''
        });
    },
    setRemoveMoreInfo(state, { index }) {
        state.dataset.more_info.splice(index, 1);
    },
    setAddDate(state) {
        state.dataset.dates.push({
            type: '',
            date: ''
        });
    },
    setRemoveDate(state, { index }) {
        state.dataset.dates.splice(index, 1);
    },
    resetDataset(state) {
        state.dataset = Object.assign({}, state.unmodifiedDataset);
    },
    abortDataset(state) {
        state.shouldAbort = true;
    },
    setError(state, { error }) {
        state.error = Object.assign({}, error);
    },
    clearError(state) {
        state.error = null;
    }
};

export default {
    namespaced: true,
    state,
    actions,
    mutations
};
