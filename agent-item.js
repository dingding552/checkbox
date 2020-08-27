import Component from '@ember/component';
import {observer} from "@ember/object";//new for checkbox
import {BT, XSD, ACTN, RDF, RDFS, HTTP, SPIN,AGENTS} from "ajan-editor/helpers/RDFServices/vocabulary";
import rdfGraph from "ajan-editor/helpers/RDFServices/RDF-graph";
import rdfManager from "ajan-editor/helpers/RDFServices/RDF-manager";
import rdfFact from "ajan-editor/helpers/RDFServices/RDF-factory";
import globals from "ajan-editor/helpers/global-parameters";
import actions from "ajan-editor/helpers/agents/actions";

let ajax = null;
let self;
let activeAgent;

export default Component.extend({

	overview: null,
	activeAgent: null,
	activeValue: null,
	newVariable: "?",
	edit: "",
	init() {
	    this._super(...arguments);
	    self = this;
			reset();


	},
	didReceiveAttrs() {
		this._super(...arguments);
		if(this.activeService != null) {
			if(self.activeService.communication === "Synchronous")
				$(".item.item-abort-binding").hide();
			else {
				$(".item.item-abort-binding").show();
			}
		}
	},




  actions: {
     newhandlCheck(items) {
      this.set('newcheckedPermissions', items);

      },

     handleCheck(items) {
      this.set('checkedPermissions', items);
    },

    edit(key, value) {
      if (!self.edit) {
        self.activeValue = value;
        self.edit = key;
        self.actions.toggle(key);
      }
    },

    activate(item) {
      $("#item-bindings .active").removeClass("active");
      if (item == "run") {
        $(".item-run-binding").addClass("active");
      } else {
        $(".item-abort-binding").addClass("active");
      }
    },

    save(s, p, o,type) {
      rdfGraph.setObjectValue(s, p, o, type = XSD.string);
      if (o == ACTN.Synchronous) {
				self.set("activeService." + self.edit, "Synchronous");
				if(self.activeService.abort != null) {
					deleteAbortBinding();
				}
			}
			else if (o == ACTN.Asynchronous) {
				self.set("activeService." + self.edit, "Asynchronous");
				if(self.activeService.abort == null) {
					createAbortBinding();
				}
			}

			if (o == HTTP.Post)
				self.set("activeService." + self.edit, "POST");
			else if (o == HTTP.Put)
				self.set("activeService." + self.edit, "PUT");
			else if (o == HTTP.Get)
				self.set("activeService." + self.edit, "GET");
			else if (o == HTTP.Patch)
				self.set("activeService." + self.edit, "PATCH");
			else if (o == HTTP.Delete)
				self.set("activeService." + self.edit, "DELETE");
			else if (o == HTTP.Copy)
				self.set("activeService." + self.edit, "Copy");
			else if (o == HTTP.Head)
				self.set("activeService." + self.edit, "HEAD");
			else if (o == HTTP.Options)
				self.set("activeService." + self.edit, "OPTIONS");
			else if (o == HTTP.Link)
				self.set("activeService." + self.edit, "LINK");
			else if (o == HTTP.Unlink)
				self.set("activeService." + self.edit, "UNLINK");
			else if (o == HTTP.Purge)
				self.set("activeService." + self.edit, "PURGE");
			else if (o == HTTP.Lock)
				self.set("activeService." + self.edit, "LOCK");
			else if (o == HTTP.Unlock)
				self.set("activeService." + self.edit, "UNLOCK");
			else if (o == HTTP.Propfind)
				self.set("activeService." + self.edit, "PROPFIND");
			else if (o == HTTP.View)
				self.set("activeService." + self.edit, "VIEW");

			self.actions.toggle(self.edit);
			reset();
			updateRepo();
		},

		saveVariable(val) {
			self.get("activeService.variables").addObject(addNewVariable(val));
			self.actions.toggle("variables");
			self.set(self.newVariable, "?");
			updateRepo();
			reset();
		},

/////////////////////////////////for AgentTemplate///////////////////////////////////////////////
	    //actions.deleteactiveAgentsbehaviorbutkeepone(activeAgent,newselectbehaviors);
	    //console.log("activeAgent.behavior");
	    //console.log(self.get("activeAgent.behavior"));
    savenewbehaviors(newbehaviors){
	    self.set("activeAgent.behaviors",[]);
	    actions.deleteactiveAgentsbehavior(self.get("activeAgent"));
	    for(var i=0;i<newbehaviors.length;i++){
	      self.get("activeAgent.behaviors").push(newbehaviors[i]);//totally new
        var rdftriple= rdfFact.quadLiteral(self.get("activeAgent.uri") ,"http://www.ajan.de/ajan-ns#behavior", newbehaviors[i].uri, "http://www.w3.org/2001/XMLSchema#anyURI");
        rdfGraph.add(rdftriple);
			  updateRepo();
			  reset();
	    }
      self.actions.toggle("behavior");
 },

    savenewevents(newevents){
	    self.set("activeAgent.events",[]);
	    actions.deleteactiveAgentsevent(self.get("activeAgent"));
	    for(var i=0;i<newevents.length;i++){
	      self.get("activeAgent.events").push(newevents[i]);//totally new
        var rdftriple= rdfFact.quadLiteral(self.get("activeAgent.uri") ,"http://www.ajan.de/ajan-ns#event", newevents[i].uri, "http://www.w3.org/2001/XMLSchema#anyURI");
        rdfGraph.add(rdftriple);
			  updateRepo();
			  reset();
	    }
      self.actions.toggle("event");
 },
     savenewendpoints(newendpoints){
	    self.set("activeAgent.endpoints",[]);
	    actions.deleteactiveAgentsendpoint(self.get("activeAgent"));
	    for(var i=0;i<newendpoints.length;i++){
	      self.get("activeAgent.endpoints").push(newendpoints[i]);//totally new
        var rdftriple= rdfFact.quadLiteral(self.get("activeAgent.uri") ,"http://www.ajan.de/ajan-ns#endpoint", newendpoints[i].uri, "http://www.w3.org/2001/XMLSchema#anyURI");
        rdfGraph.add(rdftriple);
			  updateRepo();
			  reset();
	    }
      self.actions.toggle("endpoint");
 },

/////////////////////////////////for Individual Behavior ///////////////////////////////////////////////
    savenewtriggers(newtriggers){
	    self.set("activeBehavior.triggers",[]);
	    actions.deleteactiveBehaviorstrigger(self.get("activeBehavior"));
	    for(var i=0;i<newtriggers.length;i++){
	      self.get("activeBehavior.triggers").push(newtriggers[i]);//totally new
        var rdftriple= rdfFact.quadLiteral(self.get("activeBehavior.uri") ,"http://www.ajan.de/ajan-ns#trigger", newtriggers[i].uri, "http://www.w3.org/2001/XMLSchema#anyURI");
        rdfGraph.add(rdftriple);
			  updateRepo();
			  reset();
	    }
      self.actions.toggle("trigger");
 },

 savenewbts(newbts){
	    self.set("activeBehavior.bts",[]);
	    actions.deleteactiveBehaviorsbt(self.get("activeBehavior"));
	    for(var i=0;i<newbts.length;i++){
	      self.get("activeBehavior.bts").push(newbts[i].uri);//totally new
        var rdftriple= rdfFact.quadLiteral(self.get("activeBehavior.uri") ,"http://www.ajan.de/ajan-ns#bt", newbts[i].uri, "http://www.w3.org/2001/XMLSchema#anyURI");
        rdfGraph.add(rdftriple);
			  updateRepo();
			  reset();
	    }
      self.actions.toggle("bt");
 },
    /////////////////////////////////for Individual Endpoint ///////////////////////////////////////////////

    savenewendpointevents(newendpointevents){
	    self.set("activeEndpoint.events",[]);
	    actions.deleteactiveEndpointsevent(self.get("activeEndpoint"));
	    for(var i=0;i<newendpointevents.length;i++){
	      self.get("activeEndpoint.events").push(newendpointevents[i]);//totally new
        var rdftriple= rdfFact.quadLiteral(self.get("activeEndpoint.uri") ,"http://www.ajan.de/ajan-ns#event", newendpointevents[i].uri, "http://www.w3.org/2001/XMLSchema#anyURI");
        rdfGraph.add(rdftriple);
			  updateRepo();
			  reset();
	    }
      self.actions.toggle("endpointevent");
 },



		deleteVariable(ele, val) {
			rdfManager.removeListItem(val.pointerUri);
			self.set("activeService.variables", ele.filter(item => item !== val));
			updateRepo();
		},

		 deleteagent() {
	      deleteActiveAgent()
        updateRepo();
        reset();
      },

      deletebehavior()  {
        deleteActiveBehavior()
        updateRepo();
        reset();
      },

      deleteevent() {
        deleteActiveEvent()
        updateRepo();
        reset();
      },
      deleteendpoint() {
        deleteActiveEndpoint()
        updateRepo();
        reset();
      },
     deletegoal() {
	      deleteActiveGoal()
        updateRepo();
        reset();
      },

		cancel() {
			self.actions.toggle(self.edit);
			self.set("activeAgent." + self.edit, self.activeValue);
			reset();
		},

		toggle(key) {
			switch(key) {
        case "agenturi":self.toggleProperty('editagentURI'); break;
        case "behavioruri":self.toggleProperty('editbehaviorURI'); break;
        case "eventuri":self.toggleProperty('editeventURI'); break;
        case "endpointuri":self.toggleProperty('editendpointURI'); break;

			  case "AGENT": self.toggleProperty('showAgent'); break;
				case "label": self.toggleProperty('editLabel'); break;

				case "behavior": self.toggleProperty('editBehavior'); break;
				case "event": self.toggleProperty('editEvent'); break;
				case "endpoint": self.toggleProperty('editEndpoint'); break;

				case "behaviorlabel": self.toggleProperty('editBehaviorLabel'); break;
				case "trigger": self.toggleProperty('editTrigger'); break;
				case "bt": self.toggleProperty('editBt'); break;

        case "eventlabel": self.toggleProperty('editEventLabel'); break;

        case "endpointlabel": self.toggleProperty('editEndpointLabel'); break;
        case "endpointevent": self.toggleProperty('editEndpointEvent'); break;
        case "paramValue": self.toggleProperty('editParamValue'); break;

        case "goallabel": self.toggleProperty('editGoalLabel'); break;
        case "goalvar": self.toggleProperty('editGoalVar'); break;

				case "communication": self.toggleProperty('editCommunication'); break;
				case "variables": self.toggleProperty('addVariable'); break;
				case "consumes.sparql": self.toggleProperty('editConsumes'); break;
				case "produces.sparql": self.toggleProperty('editProduces'); break;
				case "run.mthd": self.toggleProperty('editRunMthd'); break;
				case "run.version": self.toggleProperty('editRunVersion'); break;
				case "run.requestUri": self.toggleProperty('editRunURI'); break;
				case "run.payload.sparql": self.toggleProperty('editRunPayload'); break;
				case "abort.mthd": self.toggleProperty('editAbortMthd'); break;
				case "abort.version": self.toggleProperty('editAbortVersion'); break;
				case "abort.requestUri": self.toggleProperty('editAbortURI'); break;
				case "abort.payload.sparql": self.toggleProperty('editAbortPayload'); break;

				default:
					break;
			}
		}
	}
});


function deleteActiveAgent() {
	actions.deleteAgent(self.activeAgent);
	self.overview.set("availableAgents", self.overview.availableAgents.filter(item => item !== self.activeAgent));
	self.overview.actions.setActiveAgent(self.overview.availableAgents[0]);
}
function deleteActiveBehavior() {
	actions.deleteBehavior(self.activeBehavior);
	self.overview.set("availableBehaviors", self.overview.availableBehaviors.filter(item => item !== self.activeBehavior));
	self.overview.actions.setActiveBehavior(self.overview.availableBehaviors[0]);
}
function deleteActiveEvent() {
	actions.deleteEvent(self.activeEvent);
	self.overview.set("availableEvents", self.overview.availableEvents.filter(item => item !== self.activeEvent));
	self.overview.actions.setActiveEvent(self.overview.availableEvents[0]);
}
function deleteActiveEndpoint() {
	actions.deleteEndpoint(self.activeEndpoint);
	self.overview.set("availableEndpoints", self.overview.availableEndpoints.filter(item => item !== self.activeEndpoint));
	self.overview.actions.setActiveEndpoint(self.overview.availableEndpoints[0]);
}

function deleteActiveGoal() {
	actions.deleteGoal(self.activeGoal);
	self.overview.set("availableGoals", self.overview.availableGoals.filter(item => item !== self.activeGoal));
	self.overview.actions.setActiveGoal(self.overview.availableGoals[0]);
}

function deleteactiveAgentsbehavior() {
	actions.deleteactiveAgentsbehavior(self.activeAgent);
}

function createAbortBinding() {
	let binding = actions.createDefaultBinding();
	self.activeService.abort = binding;
	$(".item.item-abort-binding").show();
	self.rerender();
	createRDFAbortBinding(binding);
}

function createRDFAbortBinding(binding) {
	actions.createBinding("abort", self.activeService.uri, binding);
	updateRepo();
}

function deleteAbortBinding() {
	actions.deleteBinding(self.activeService.abort);
	delete self.activeService.abort;
	self.actions.activate("run");
	$(".item.item-abort-binding").hide();
}

function addNewVariable(val) {
	let variable = {}
	let resource = rdfFact.blankNode();
	variable.var = val.replace("?","");
	variable.uri = resource.value;
	actions.createVariable(resource, variable);
	actions.appendVariable(resource, variable, self.activeService.variables);
	return variable;
}

function updateRepo() {
	let repo = (localStorage.currentStore || "http://localhost:8090/rdf4j/repositories")
						+ globals.agentsRepository;
	actions.saveAgentGraph(globals.ajax,repo);
}

function reset() {
	self.activeValue = null;
	self.actions.activate("run");
	self.edit = "";
}

